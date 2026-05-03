import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, isAdmin, unauthorizedResponse } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getRequestUser(req);
  if (!user || !(await isAdmin(user.id))) return unauthorizedResponse();

  if (params.id === user.id) {
    return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
