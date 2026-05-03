import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, isAdmin, unauthorizedResponse } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user || !(await isAdmin(user.id))) return unauthorizedResponse();

  const admin = createAdminClient();
  const { data: plans, error } = await admin
    .from("planes")
    .select("id, user_id, titulo, activo, created_at, plan_data")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, nombre, apellidos, email");
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const result = (plans ?? []).map((p) => ({
    ...p,
    user_nombre: profileMap.get(p.user_id)?.nombre ?? null,
    user_apellidos: profileMap.get(p.user_id)?.apellidos ?? null,
    user_email: profileMap.get(p.user_id)?.email ?? null,
  }));

  return NextResponse.json({ plans: result });
}

export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user || !(await isAdmin(user.id))) return unauthorizedResponse();

  const body = await req.json();
  const { user_id, titulo, plan_data } = body as {
    user_id?: string;
    titulo?: string;
    plan_data?: unknown;
  };

  if (!user_id || !titulo || !plan_data) {
    return NextResponse.json(
      { error: "user_id, titulo y plan_data son requeridos" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Deactivate any current active plan for that user
  await admin.from("planes").update({ activo: false }).eq("user_id", user_id).eq("activo", true);

  const { data, error } = await admin
    .from("planes")
    .insert({ user_id, titulo, plan_data, activo: true })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
