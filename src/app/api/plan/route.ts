import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const requestSchema = z.object({
  objetivo: z.enum(["rugby", "navette", "carrera_popular", "forma_fisica"]),
  nivel: z.enum(["sedentario", "algo_activo", "activo"]),
  diasDisponibles: z.number().min(1).max(7),
  fechaEvento: z.string().optional(),
  semanasHastaObjetivo: z.number().min(1).max(52).optional(),
});

const OBJETIVO_LABELS: Record<string, string> = {
  rugby: "rugby (preparación física específica para rugby: potencia, agilidad, resistencia)",
  navette: "test de Course Navette / Léger (mejorar el VO2max y resistencia aeróbica)",
  carrera_popular: "carrera popular (completar o mejorar marca en una carrera de calle)",
  forma_fisica: "mejorar la forma física general (salud, composición corporal y bienestar)",
};

const NIVEL_LABELS: Record<string, string> = {
  sedentario: "sedentario (no hace ejercicio actualmente, punto de partida desde cero)",
  algo_activo: "algo activo (hace algo de ejercicio ocasionalmente, 1-2 veces por semana)",
  activo: "activo (entrena regularmente, 3 o más veces por semana)",
};

function calcularSemanas(data: z.infer<typeof requestSchema>): number {
  if (data.semanasHastaObjetivo) return Math.max(4, Math.min(data.semanasHastaObjetivo, 16));
  if (data.fechaEvento) {
    const diff = Math.ceil(
      (new Date(data.fechaEvento).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)
    );
    return Math.max(4, Math.min(diff, 16));
  }
  return 8;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const data = parsed.data;
  const totalSemanas = calcularSemanas(data);

  const prompt = `Eres un coach de fitness y running experto. Genera un plan de entrenamiento personalizado en JSON.

Perfil del usuario:
- Objetivo: ${OBJETIVO_LABELS[data.objetivo]}
- Nivel actual: ${NIVEL_LABELS[data.nivel]}
- Días disponibles por semana: ${data.diasDisponibles}
- Duración del plan: ${totalSemanas} semanas

Instrucciones importantes:
- Diseña exactamente ${data.diasDisponibles} sesiones por semana (no más).
- Adapta la intensidad y volumen al nivel "${data.nivel}".
- El plan debe ser progresivo: cada semana aumenta ligeramente la carga.
- Los ejercicios deben ser detallados y con instrucciones de técnica.
- Para ejercicios de carrera usa duracion (no series/repeticiones). Para fuerza usa series y repeticiones.

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta (sin texto adicional):

{
  "titulo": "string",
  "objetivo": "string descripción del objetivo",
  "nivel": "string nivel del usuario",
  "totalSemanas": ${totalSemanas},
  "semanas": [
    {
      "numero": 1,
      "descripcion": "string descripción general de la semana",
      "objetivoSemana": "string objetivo específico de esta semana",
      "sesiones": [
        {
          "dia": "Lunes",
          "tipo": "string (ej: Carrera suave, Fuerza tren inferior, HIIT, Movilidad...)",
          "duracion": 45,
          "calentamiento": "string descripción del calentamiento de 5-10 minutos",
          "ejercicios": [
            {
              "nombre": "string",
              "series": null,
              "repeticiones": null,
              "duracion": "string (ej: '20 minutos') o null si es de fuerza",
              "descanso": "string (ej: '60 segundos') o null si no aplica",
              "descripcion": "string descripción detallada del ejercicio con técnica correcta"
            }
          ],
          "vueltaCalma": "string descripción de vuelta a la calma de 5 minutos",
          "consejos": "string consejos específicos para esta sesión"
        }
      ]
    }
  ],
  "consejosGenerales": ["string", "string", "string", "string"],
  "nutricion": ["string", "string", "string"]
}`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 8000,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Groq error:", error);
    return NextResponse.json({ error: "Error generando el plan" }, { status: 502 });
  }

  const groqData = await response.json();
  const planJson = groqData.choices?.[0]?.message?.content ?? "{}";

  try {
    const plan = JSON.parse(planJson);
    return NextResponse.json({ plan });
  } catch {
    console.error("JSON parse error:", planJson.slice(0, 200));
    return NextResponse.json({ error: "Error procesando el plan" }, { status: 500 });
  }
}
