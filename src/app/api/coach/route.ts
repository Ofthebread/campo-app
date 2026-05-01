import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const requestSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(20)
    .optional()
    .default([]),
  planContext: z.string().optional(),
});

const BASE_SYSTEM_PROMPT = `Eres un coach de running y fitness experto llamado Campo.
Tu misión es ayudar a personas de todos los niveles a mejorar su rendimiento,
prevenir lesiones y disfrutar del proceso de entrenamiento.

Respondes siempre en español, con un tono cercano pero profesional.
Basa tus respuestas en ciencia del deporte. Sé conciso y práctico.
Si el usuario menciona dolor o lesión, recomienda siempre consultar a un profesional de salud.`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Mensaje inválido", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { message, history, planContext } = parsed.data;

  const systemPrompt = planContext
    ? `${BASE_SYSTEM_PROMPT}\n\nEl usuario tiene el siguiente plan de entrenamiento generado para él. Úsalo como referencia para responder sus preguntas:\n${planContext}`
    : BASE_SYSTEM_PROMPT;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 1024,
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
  const reply = data.choices?.[0]?.message?.content ?? "";

  return NextResponse.json({ reply });
}
