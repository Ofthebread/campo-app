import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const planRequestSchema = z.object({
  level: z.enum(["beginner", "intermediate", "advanced"]),
  weeklyKm: z.number().min(0).max(200),
  goalRace: z.enum(["5k", "10k", "half", "marathon"]).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = planRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parámetros inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Placeholder — reemplazar con lógica real o llamada a Anthropic
  return NextResponse.json({
    plan: {
      level: parsed.data.level,
      weeklyKm: parsed.data.weeklyKm,
      sessions: [],
    },
  });
}

export async function GET() {
  return NextResponse.json({ sessions: [] });
}
