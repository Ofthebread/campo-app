import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

// Verify the JWT sent in the Authorization header and return the user.
// Returns null if the token is missing or invalid.
export async function getRequestUser(req: NextRequest): Promise<User | null> {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "").trim();
  if (!token) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

// Strip characters that could be used for prompt injection in LLM calls.
export function sanitizeForPrompt(input: string): string {
  return input
    .replace(/<\/?[^>]+(>|$)/g, "") // strip HTML/XML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars
    .trim()
    .slice(0, 1000); // hard cap — Zod already limits but double-check
}
