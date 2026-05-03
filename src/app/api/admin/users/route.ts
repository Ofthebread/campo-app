import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, isAdmin, unauthorizedResponse } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user || !(await isAdmin(user.id))) return unauthorizedResponse();

  const admin = createAdminClient();
  const { data: { users }, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, nombre, apellidos, role");
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const result = users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    nombre: profileMap.get(u.id)?.nombre ?? null,
    apellidos: profileMap.get(u.id)?.apellidos ?? null,
    role: profileMap.get(u.id)?.role ?? "user",
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
    email_confirmed_at: u.email_confirmed_at ?? null,
  }));

  return NextResponse.json({ users: result });
}

export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user || !(await isAdmin(user.id))) return unauthorizedResponse();

  const body = await req.json();
  const { email, nombre, apellidos, password } = body as {
    email?: string;
    nombre?: string;
    apellidos?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (nombre || apellidos) {
    await admin.from("profiles").upsert({
      id: data.user.id,
      email,
      nombre: nombre ?? null,
      apellidos: apellidos ?? null,
    });
  }

  return NextResponse.json({ user: data.user }, { status: 201 });
}
