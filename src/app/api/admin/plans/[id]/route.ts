import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, isAdmin, unauthorizedResponse } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getRequestUser(req);
  if (!user || !(await isAdmin(user.id))) return unauthorizedResponse();

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.titulo !== undefined) updates.titulo = body.titulo;
  if (body.plan_data !== undefined) updates.plan_data = body.plan_data;
  if (body.activo !== undefined) updates.activo = body.activo;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  const admin = createAdminClient();

  // If activating this plan, deactivate others for the same user first
  if (updates.activo === true) {
    const { data: plan } = await admin
      .from("planes")
      .select("user_id")
      .eq("id", params.id)
      .single();
    if (plan) {
      await admin
        .from("planes")
        .update({ activo: false })
        .eq("user_id", plan.user_id)
        .neq("id", params.id);
    }
  }

  const { error } = await admin.from("planes").update(updates).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getRequestUser(req);
  if (!user || !(await isAdmin(user.id))) return unauthorizedResponse();

  const admin = createAdminClient();
  await admin.from("sesiones_completadas").delete().eq("plan_id", params.id);
  const { error } = await admin.from("planes").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
