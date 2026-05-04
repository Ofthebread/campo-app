import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestUser, unauthorizedResponse, sanitizeForPrompt } from "@/lib/auth-server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_TIMEOUT_MS = 60_000;

// ── Request schema ────────────────────────────────────────────────────────────

const requestSchema = z.object({
  objetivo: z.string().min(1).max(1000),
  volumenCarrera: z.enum(["nada", "menos_20", "20_40", "mas_40"]),
  lesiones: z.string().max(500).optional().default(""),
  edad: z.number().min(10).max(99),
  peso: z.number().min(30).max(250),
  diasDisponibles: z.number().min(1).max(7),
  duracionMaxSesion: z.enum(["30min", "45min", "1h", "mas_1h"]),
  lugarEntrenamiento: z.enum(["calle", "pista", "cinta", "campo"]),
  tieneDispositivo: z.boolean().optional().default(false),
  otrosDeportes: z.string().max(500).optional().default(""),
  preferenciaEntrenamiento: z.enum(["corta_intensa", "larga_suave"]),
});

// ── Response schema (validates what Groq returns) ─────────────────────────────

// Groq can return numbers or strings interchangeably — handle both
const strOrNum = z.union([z.string(), z.number()]).transform(String);
const numOrStr = z.union([z.number(), z.string()]).transform(Number);
const nullableStrOrNum = z.union([z.string(), z.number(), z.null()]).nullable().optional()
  .transform(v => (v == null ? null : String(v)));

const ejercicioSchema = z.object({
  nombre: z.string().default(""),
  series: z.union([z.number(), z.string(), z.null()]).nullable().optional(),
  repeticiones: nullableStrOrNum,
  duracion: nullableStrOrNum,
  descanso: nullableStrOrNum,
  descripcion: z.string().default(""),
}).passthrough();

const sesionSchema = z.object({
  dia: z.string(),
  tipo: z.string().default(""),
  duracion: numOrStr.optional().default(30),
  calentamiento: z.string().default(""),
  ejercicios: z.array(ejercicioSchema).default([]),
  vueltaCalma: z.string().default(""),
  consejos: z.string().default(""),
}).passthrough();

const semanaSchema = z.object({
  numero: numOrStr,
  descripcion: z.string().default(""),
  objetivoSemana: z.string().default(""),
  sesiones: z.array(sesionSchema).default([]),
}).passthrough();

const planSchema = z.object({
  titulo: z.string(),
  objetivo: strOrNum.optional().default(""),
  nivel: strOrNum.optional().default(""),
  totalSemanas: numOrStr,
  semanas: z.array(semanaSchema).min(1),
  consejosGenerales: z.array(z.union([z.string(), z.number()]).transform(String)).default([]),
  nutricion: z.array(z.union([z.string(), z.number()]).transform(String)).default([]),
}).passthrough();

// ── Labels ────────────────────────────────────────────────────────────────────

const VOLUMEN_LABELS: Record<string, string> = {
  nada: "no corre actualmente (punto de partida desde cero)",
  menos_20: "corre menos de 20 minutos seguidos",
  "20_40": "corre entre 20 y 40 minutos seguidos",
  mas_40: "corre más de 40 minutos seguidos con comodidad",
};

const DURACION_LABELS: Record<string, string> = {
  "30min": "máximo 30 minutos por sesión",
  "45min": "máximo 45 minutos por sesión",
  "1h": "máximo 1 hora por sesión",
  mas_1h: "más de 1 hora por sesión",
};

const LUGAR_LABELS: Record<string, string> = {
  calle: "calle o asfalto",
  pista: "pista de atletismo",
  cinta: "cinta de correr (indoor)",
  campo: "campo o trail / hierba",
};

const PREFERENCIA_LABELS: Record<string, string> = {
  corta_intensa: "sesiones cortas e intensas (prefiere calidad sobre cantidad)",
  larga_suave: "sesiones largas y suaves (prefiere volumen y resistencia)",
};

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth check — reject unauthenticated requests
  const user = await getRequestUser(req);
  if (!user) return unauthorizedResponse();

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    console.error("Validation errors:", JSON.stringify(parsed.error.issues, null, 2));
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const d = parsed.data;
  const totalSemanas = 8;

  // Sanitize free-text fields before embedding in the prompt
  const objetivo = sanitizeForPrompt(d.objetivo);
  const lesiones = sanitizeForPrompt(d.lesiones);
  const otrosDeportes = sanitizeForPrompt(d.otrosDeportes);

  const prompt = `Eres un coach de fitness y running experto. Genera un plan de entrenamiento personalizado en JSON.

Perfil completo del usuario:
- Objetivo personal: "${objetivo}"
- Edad: ${d.edad} años
- Peso: ${d.peso} kg
- Volumen de carrera actual: ${VOLUMEN_LABELS[d.volumenCarrera]}
- Lesiones o limitaciones físicas: ${lesiones || "ninguna"}
- Días disponibles para entrenar: ${d.diasDisponibles} días por semana
- Duración máxima por sesión: ${DURACION_LABELS[d.duracionMaxSesion]}
- Lugar de entrenamiento: ${LUGAR_LABELS[d.lugarEntrenamiento]}
- Dispone de pulsómetro o Apple Watch: ${d.tieneDispositivo ? "sí, puede entrenar por zonas de frecuencia cardíaca" : "no"}
- Otros deportes que practica: ${otrosDeportes || "ninguno"}
- Preferencia de entrenamiento: ${PREFERENCIA_LABELS[d.preferenciaEntrenamiento]}

Instrucciones importantes:
- Diseña exactamente ${d.diasDisponibles} sesiones por semana.
- Respeta estrictamente la duración máxima por sesión indicada.
- Adapta los ejercicios al lugar de entrenamiento (${LUGAR_LABELS[d.lugarEntrenamiento]}).
- ${d.lesiones ? `Ten en cuenta las siguientes limitaciones físicas: ${lesiones}. Evita ejercicios que puedan agravar estas condiciones.` : ""}
- ${d.tieneDispositivo ? "Incluye referencias a zonas de frecuencia cardíaca cuando sea útil." : "No menciones zonas de frecuencia cardíaca ni pulsómetro."}
- El plan debe ser progresivo: cada semana aumenta ligeramente la carga.
- Adapta la intensidad a la preferencia del usuario: ${PREFERENCIA_LABELS[d.preferenciaEntrenamiento]}.
- Los ejercicios deben ser detallados con instrucciones de técnica correcta.
- Para carrera usa duracion (no series/reps). Para fuerza usa series y repeticiones.
- El plan debe empezar desde el nivel actual: ${VOLUMEN_LABELS[d.volumenCarrera]}.

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta:

{
  "titulo": "string descriptivo del plan",
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
              "descripcion": "string descripción detallada con técnica correcta"
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
        model: "llama-3.3-70b-versatile",
        max_tokens: 8000,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error("Groq error status:", response.status);
      return NextResponse.json({ error: "Error generando el plan" }, { status: 502 });
    }

    const groqData = await response.json();
    const planJson = groqData.choices?.[0]?.message?.content ?? "{}";

    let rawPlan: unknown;
    try {
      rawPlan = JSON.parse(planJson);
    } catch {
      console.error("Groq returned invalid JSON");
      return NextResponse.json({ error: "Error procesando el plan" }, { status: 500 });
    }

    const validated = planSchema.safeParse(rawPlan);
    if (!validated.success) {
      console.error("Plan validation errors:", JSON.stringify(validated.error.issues, null, 2));
      console.error("Raw plan keys:", Object.keys(rawPlan as object));
      return NextResponse.json({ error: "El plan generado no tiene el formato esperado. Inténtalo de nuevo." }, { status: 500 });
    }

    return NextResponse.json({ plan: validated.data });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "La generación tardó demasiado. Inténtalo de nuevo." }, { status: 504 });
    }
    console.error("Unexpected error in /api/plan");
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}
