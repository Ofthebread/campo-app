import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const requestSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(20)
    .optional()
    .default([]),
  planContext: z.string().optional(),
});

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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
  }

  const { message, history, planContext } = parsed.data;

  const systemPrompt = planContext
    ? `${BASE_SYSTEM_PROMPT}\n\nEl usuario tiene el siguiente plan de entrenamiento. Úsalo como referencia y como base para cualquier modificación:\n${planContext}`
    : BASE_SYSTEM_PROMPT;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
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
        { role: "user", content: message },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Groq error:", error);
    return NextResponse.json({ error: "Error al contactar al coach" }, { status: 502 });
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json({
      reply: parsed.reply ?? "",
      updatedPlan: parsed.updatedPlan ?? null,
    });
  } catch {
    return NextResponse.json({ reply: raw, updatedPlan: null });
  }
}
