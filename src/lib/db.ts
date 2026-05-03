import { supabase } from "./supabase";
import type { PlanEntrenamiento } from "@/types/plan";

export interface ProfileData {
  id: string;
  nombre: string | null;
  apellidos: string | null;
  email: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  peso_kg: number | null;
  altura_cm: number | null;
  ciudad: string | null;
  pais: string | null;
  objetivo: string | null;
  dias_semana: number | null;
  role: string | null;
}

export interface PlanResumen {
  id: string;
  titulo: string;
  activo: boolean;
  created_at: string;
  plan_data: PlanEntrenamiento;
}

export async function getProfile(): Promise<ProfileData | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, nombre, apellidos, email, telefono, fecha_nacimiento, genero, peso_kg, altura_cm, ciudad, pais, objetivo, dias_semana, role")
    .eq("id", session.user.id)
    .single();
  return data as ProfileData | null;
}

export async function updateProfile(fields: {
  nombre?: string;
  apellidos?: string;
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
  if (!session) throw new Error("No hay sesión activa");
  const { error } = await supabase.from("profiles").update(fields).eq("id", session.user.id);
  if (error) throw new Error(error.message);
}

export async function getAllPlans(): Promise<PlanResumen[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];
  const { data } = await supabase
    .from("planes")
    .select("id, titulo, activo, created_at, plan_data")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as PlanResumen[];
}

export async function setActivePlan(planId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  await supabase.from("planes").update({ activo: false }).eq("user_id", session.user.id);
  await supabase.from("planes").update({ activo: true }).eq("id", planId).eq("user_id", session.user.id);
}

export async function deletePlan(planId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  await supabase.from("sesiones_completadas").delete().eq("plan_id", planId).eq("user_id", session.user.id);
  await supabase.from("planes").delete().eq("id", planId).eq("user_id", session.user.id);
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
