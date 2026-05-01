"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/supabase";

type Tab = "login" | "register";

export default function AuthForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(form.email, form.password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? traducirError(err.message) : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password !== form.passwordConfirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.nombre, form.apellidos);
      setSuccess("Cuenta creada. Revisa tu email para confirmarla y luego inicia sesión.");
    } catch (err) {
      setError(err instanceof Error ? traducirError(err.message) : "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-sm mx-auto">
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6">
        <button
          onClick={() => { setTab("login"); setError(null); setSuccess(null); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Entrar
        </button>
        <button
          onClick={() => { setTab("register"); setError(null); setSuccess(null); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      {tab === "login" && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      )}

      {tab === "register" && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="Ana"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos</label>
              <input
                type="text"
                required
                value={form.apellidos}
                onChange={(e) => set("apellidos", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="García"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Repetir contraseña</label>
            <input
              type="password"
              required
              value={form.passwordConfirm}
              onChange={(e) => set("passwordConfirm", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      )}
    </div>
  );
}

function traducirError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Email o contraseña incorrectos";
  if (msg.includes("Email not confirmed")) return "Confirma tu email antes de entrar";
  if (msg.includes("User already registered")) return "Ya existe una cuenta con este email";
  if (msg.includes("Password should be")) return "La contraseña debe tener al menos 8 caracteres";
  return msg;
}
