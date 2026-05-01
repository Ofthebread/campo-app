import { supabase } from "./supabase";
import type { PlanEntrenamiento } from "@/types/plan";

export async function updateProfile(fields: {
  objetivo?: string;
  nivel?: string;
  dias_semana?: number;
  peso_kg?: number;
  altura_cm?: number;
  ciudad?: string;
  pais?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  await supabase.from("profiles").update(fields).eq("id", session.user.id);
}

export async function savePlan(plan: PlanEntrenamiento): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No hay sesión activa");

  await supabase
    .from("planes")
    .update({ activo: false })
    .eq("user_id", session.user.id)
    .eq("activo", true);

  const { data, error } = await supabase
    .from("planes")
    .insert({
      user_id: session.user.id,
      titulo: plan.titulo,
      plan_data: plan,
      activo: true,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function getActivePlan(): Promise<{
  id: string;
  plan: PlanEntrenamiento;
} | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from("planes")
    .select("id, plan_data")
    .eq("user_id", session.user.id)
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return { id: data.id as string, plan: data.plan_data as PlanEntrenamiento };
}

export async function getSesionesCompletadas(planId: string): Promise<string[]> {
  const { data } = await supabase
    .from("sesiones_completadas")
    .select("semana_numero, sesion_dia")
    .eq("plan_id", planId);

  return (data ?? []).map((s) => `${s.semana_numero}-${s.sesion_dia}`);
}

export async function toggleSesion(
  planId: string,
  semanaNumero: number,
  sesionDia: string,
  sesionTipo: string
): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const { data: existing } = await supabase
    .from("sesiones_completadas")
    .select("id")
    .eq("plan_id", planId)
    .eq("semana_numero", semanaNumero)
    .eq("sesion_dia", sesionDia)
    .maybeSingle();

  if (existing) {
    await supabase.from("sesiones_completadas").delete().eq("id", existing.id);
    return false;
  }

  await supabase.from("sesiones_completadas").insert({
    user_id: session.user.id,
    plan_id: planId,
    semana_numero: semanaNumero,
    sesion_dia: sesionDia,
    sesion_tipo: sesionTipo,
  });
  return true;
}
