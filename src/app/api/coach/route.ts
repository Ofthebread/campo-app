import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestUser, unauthorizedResponse, sanitizeForPrompt } from "@/lib/auth-server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_TIMEOUT_MS = 45_000;

// ── Request schema ────────────────────────────────────────────────────────────

const requestSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(20)
    .optional()
    .default([]),
  planContext: z.string().max(20000).optional(),
});

// ── Response schema ───────────────────────────────────────────────────────────

const coachResponseSchema = z.object({
  reply: z.string(),
  updatedPlan: z.unknown().nullable().optional(),
});

// ── System prompt ─────────────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `Eres un coach de running y fitness experto llamado Campo.
Tu misión es ayudar a personas de todos los niveles a mejorar su rendimiento,
prevenir lesiones y disfrutar del proceso de entrenamiento.
Respondes siempre en español de España, con un tono cercano pero profesional.
Basa tus respuestas en ciencia del deporte. Sé conciso y práctico.
Si el usuario menciona dolor o lesión, recomienda siempre consultar a un profesional de salud.

IMPORTANTE: Responde SIEMPRE en formato JSON con esta estructura exacta:
{
  "reply": "tu respuesta en texto",
  "updatedPlan": null
}

Si el usuario pide modificar, cambiar o ajustar su plan de entrenamiento, genera el plan actualizado
y devuélvelo en el campo "updatedPlan" siguiendo EXACTAMENTE esta estructura JSON:
{
  "reply": "Explicación de los cambios que has hecho",
  "updatedPlan": {
    "titulo": "string",
    "objetivo": "string",
    "nivel": "string",
    "totalSemanas": number,
    "consejosGenerales": ["string"],
    "nutricion": ["string"],
    "semanas": [
      {
        "numero": number,
        "descripcion": "string",
        "objetivoSemana": "string",
        "sesiones": [
          {
            "dia": "string",
            "tipo": "string",
            "duracion": number,
            "calentamiento": "string",
            "vueltaCalma": "string",
            "consejos": "string",
            "ejercicios": [
              {
                "nombre": "string",
                "series": number | null,
                "repeticiones": "string | null",
                "duracion": "string | null",
                "descanso": "string | null",
                "descripcion": "string"
              }
            ]
          }
        ]
      }
    ]
  }
}`;

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth check
  const user = await getRequestUser(req);
  if (!user) return unauthorizedResponse();

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
  }

  const { message, history, planContext } = parsed.data;

  // Sanitize the user message before sending to LLM
  const safeMessage = sanitizeForPrompt(message);

  const systemPrompt = planContext
    ? `${BASE_SYSTEM_PROMPT}\n\nEl usuario tiene el siguiente plan de entrenamiento. Úsalo como referencia y como base para cualquier modificación:\n${planContext}`
    : BASE_SYSTEM_PROMPT;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: safeMessage },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Groq error status:", response.status);
      return NextResponse.json({ error: "Error al contactar al coach" }, { status: 502 });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";

    let rawParsed: unknown;
    try {
      rawParsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ reply: "Lo siento, ha habido un error. Inténtalo de nuevo.", updatedPlan: null });
    }

    const validated = coachResponseSchema.safeParse(rawParsed);
    if (!validated.success) {
      return NextResponse.json({ reply: "Lo siento, ha habido un error. Inténtalo de nuevo.", updatedPlan: null });
    }

    return NextResponse.json({
      reply: validated.data.reply,
      updatedPlan: validated.data.updatedPlan ?? null,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "El coach tardó demasiado en responder. Inténtalo de nuevo." }, { status: 504 });
    }
    console.error("Unexpected error in /api/coach");
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}
