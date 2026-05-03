"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSessionToken } from "@/lib/supabase";
import type { PlanEntrenamiento } from "@/types/plan";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  email: string;
  nombre: string | null;
  apellidos: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

interface AdminPlan {
  id: string;
  user_id: string;
  titulo: string;
  activo: boolean;
  created_at: string;
  plan_data: PlanEntrenamiento;
  user_nombre: string | null;
  user_apellidos: string | null;
  user_email: string | null;
}

type Tab = "usuarios" | "entrenamientos";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function userLabel(u: Pick<AdminUser, "nombre" | "apellidos" | "email">) {
  const name = [u.nombre, u.apellidos].filter(Boolean).join(" ");
  return name || u.email;
}

const PLAN_TEMPLATE: PlanEntrenamiento = {
  titulo: "Plan personalizado",
  objetivo: "forma_fisica",
  nivel: "algo_activo",
  totalSemanas: 4,
  semanas: [
    {
      numero: 1,
      descripcion: "Semana de adaptación",
      objetivoSemana: "Acostumbrar el cuerpo al ritmo de entrenamiento",
      sesiones: [
        {
          dia: "Lunes",
          tipo: "carrera",
          duracion: 30,
          calentamiento: "5 min caminata rápida",
          ejercicios: [
            {
              nombre: "Carrera continua",
              duracion: "20 min",
              descripcion: "Ritmo cómodo, puedes mantener una conversación",
              series: null,
              repeticiones: null,
              descanso: null,
            },
          ],
          vueltaCalma: "5 min caminata + estiramientos",
          consejos: "No te pases de ritmo la primera semana",
        },
      ],
    },
  ],
  consejosGenerales: ["Hidratación constante", "Descanso suficiente"],
  nutricion: ["Carbohidratos antes del entreno", "Proteína en la recuperación"],
};

// ─── Modal: Nuevo usuario ──────────────────────────────────────────────────────

function NewUserModal({
  onClose,
  onCreated,
  token,
}: {
  onClose: () => void;
  onCreated: () => void;
  token: string;
}) {
  const [form, setForm] = useState({ email: "", nombre: "", apellidos: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Error al crear usuario"); return; }
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-negro/60 px-4">
      <div className="w-full max-w-md bg-blanco border border-negro/10 rounded-2xl p-6 shadow-xl">
        <h3 className="font-condensed text-xl font-bold text-negro tracking-wide mb-5">NUEVO USUARIO</h3>
        {error && <p className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-condensed font-bold text-lila tracking-wide uppercase mb-1">Nombre</label>
              <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                className="w-full border border-negro/15 rounded-xl px-3 py-2.5 text-sm bg-blanco text-negro focus:outline-none focus:border-lila/60 focus:ring-1 focus:ring-lila/30" />
            </div>
            <div>
              <label className="block text-xs font-condensed font-bold text-lila tracking-wide uppercase mb-1">Apellidos</label>
              <input value={form.apellidos} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))}
                className="w-full border border-negro/15 rounded-xl px-3 py-2.5 text-sm bg-blanco text-negro focus:outline-none focus:border-lila/60 focus:ring-1 focus:ring-lila/30" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-condensed font-bold text-lila tracking-wide uppercase mb-1">Email *</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-negro/15 rounded-xl px-3 py-2.5 text-sm bg-blanco text-negro focus:outline-none focus:border-lila/60 focus:ring-1 focus:ring-lila/30" />
          </div>
          <div>
            <label className="block text-xs font-condensed font-bold text-lila tracking-wide uppercase mb-1">Contraseña inicial *</label>
            <input type="password" required minLength={8} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Mínimo 8 caracteres"
              className="w-full border border-negro/15 rounded-xl px-3 py-2.5 text-sm bg-blanco text-negro focus:outline-none focus:border-lila/60 focus:ring-1 focus:ring-lila/30" />
            <p className="mt-1 text-xs text-negro/40">El usuario podrá cambiarla desde su perfil.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-negro/15 text-negro/60 font-condensed font-bold text-sm py-3 rounded-xl hover:bg-negro/5 transition-colors tracking-wide">
              CANCELAR
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-negro text-blanco font-condensed font-bold text-sm py-3 rounded-xl hover:bg-negro/80 transition-colors disabled:opacity-50 tracking-wide">
              {loading ? "CREANDO..." : "CREAR USUARIO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Nuevo / Editar plan ────────────────────────────────────────────────

function PlanModal({
  plan,
  users,
  onClose,
  onSaved,
  token,
}: {
  plan: AdminPlan | null;
  users: AdminUser[];
  onClose: () => void;
  onSaved: () => void;
  token: string;
}) {
  const isEdit = !!plan;
  const [titulo, setTitulo] = useState(plan?.titulo ?? "");
  const [userId, setUserId] = useState(plan?.user_id ?? "");
  const [jsonText, setJsonText] = useState(
    plan ? JSON.stringify(plan.plan_data, null, 2) : JSON.stringify(PLAN_TEMPLATE, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function validateJson() {
    try {
      JSON.parse(jsonText);
      setJsonError(null);
      return true;
    } catch {
      setJsonError("JSON inválido — revisa la estructura");
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateJson()) return;
    if (!userId) { setApiError("Selecciona un usuario"); return; }
    setApiError(null);
    setLoading(true);

    const planData = JSON.parse(jsonText);
    const url = isEdit ? `/api/admin/plans/${plan!.id}` : "/api/admin/plans";
    const method = isEdit ? "PUT" : "POST";
    const body = isEdit
      ? { titulo, plan_data: planData }
      : { user_id: userId, titulo, plan_data: planData };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setApiError(data.error ?? "Error al guardar"); return; }
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-negro/60 px-0 sm:px-4">
      <div className="w-full sm:max-w-2xl bg-blanco border border-negro/10 rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[90dvh] shadow-xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-negro/10 flex-shrink-0">
          <h3 className="font-condensed text-xl font-bold text-negro tracking-wide">
            {isEdit ? "EDITAR PLAN" : "NUEVO PLAN"}
          </h3>
          <button onClick={onClose} className="text-negro/40 hover:text-negro text-sm font-condensed tracking-wide">CERRAR ✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
            {apiError && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{apiError}</p>}

            {!isEdit && (
              <div>
                <label className="block text-xs font-condensed font-bold text-lila tracking-wide uppercase mb-1">Usuario *</label>
                <select value={userId} onChange={e => setUserId(e.target.value)} required
                  className="w-full border border-negro/15 rounded-xl px-3 py-2.5 text-sm bg-blanco text-negro focus:outline-none focus:border-lila/60 focus:ring-1 focus:ring-lila/30">
                  <option value="">Selecciona un usuario...</option>
                  {users.filter(u => u.role !== "admin").map(u => (
                    <option key={u.id} value={u.id}>{userLabel(u)} — {u.email}</option>
                  ))}
                </select>
              </div>
            )}

            {isEdit && (
              <div className="bg-crema rounded-xl px-3 py-2 text-sm text-negro/60">
                Usuario: <span className="text-negro font-medium">{userLabel({ nombre: plan!.user_nombre, apellidos: plan!.user_apellidos, email: plan!.user_email ?? "" })}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-condensed font-bold text-lila tracking-wide uppercase mb-1">Título del plan *</label>
              <input required value={titulo} onChange={e => setTitulo(e.target.value)}
                placeholder="Ej: Plan 10K — 8 semanas"
                className="w-full border border-negro/15 rounded-xl px-3 py-2.5 text-sm bg-blanco text-negro focus:outline-none focus:border-lila/60 focus:ring-1 focus:ring-lila/30" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-condensed font-bold text-lila tracking-wide uppercase">
                  Datos del plan (JSON) *
                </label>
                <button type="button" onClick={() => setJsonText(JSON.stringify(PLAN_TEMPLATE, null, 2))}
                  className="text-xs text-negro/40 hover:text-negro transition-colors font-condensed tracking-wide">
                  Cargar plantilla
                </button>
              </div>
              <textarea
                value={jsonText}
                onChange={e => { setJsonText(e.target.value); setJsonError(null); }}
                onBlur={validateJson}
                rows={14}
                spellCheck={false}
                className={`w-full border rounded-xl px-3 py-2.5 text-xs font-mono bg-crema text-negro focus:outline-none focus:ring-1 transition-colors resize-none ${
                  jsonError ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-negro/15 focus:border-lila/60 focus:ring-lila/30"
                }`}
              />
              {jsonError && <p className="mt-1 text-xs text-red-500">{jsonError}</p>}
              <p className="mt-1 text-xs text-negro/30">El JSON debe seguir la estructura PlanEntrenamiento (ver plantilla).</p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-negro/10 flex gap-3 flex-shrink-0">
            <button type="button" onClick={onClose}
              className="flex-1 border border-negro/15 text-negro/60 font-condensed font-bold text-sm py-3 rounded-xl hover:bg-negro/5 transition-colors tracking-wide">
              CANCELAR
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-negro text-blanco font-condensed font-bold text-sm py-3 rounded-xl hover:bg-negro/80 transition-colors disabled:opacity-50 tracking-wide">
              {loading ? "GUARDANDO..." : isEdit ? "GUARDAR CAMBIOS" : "CREAR PLAN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm delete dialog ──────────────────────────────────────────────────

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-negro/60 px-4">
      <div className="w-full max-w-sm bg-blanco border border-negro/10 rounded-2xl p-6 shadow-xl text-center">
        <p className="text-negro text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 border border-negro/15 text-negro/60 font-condensed font-bold text-sm py-3 rounded-xl hover:bg-negro/5 transition-colors tracking-wide">
            CANCELAR
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 bg-red-500 text-blanco font-condensed font-bold text-sm py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 tracking-wide">
            {loading ? "ELIMINANDO..." : "ELIMINAR"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("usuarios");
  const [accessDenied, setAccessDenied] = useState(false);

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [showNewUser, setShowNewUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deletingUserLoading, setDeletingUserLoading] = useState(false);

  // Plans state
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<AdminPlan | null>(null);
  const [deletingPlanLoading, setDeletingPlanLoading] = useState(false);
  const [filterUserId, setFilterUserId] = useState("");

  // ── Auth init ────────────────────────────────────────────────────────────
  useEffect(() => {
    getSessionToken().then((t) => {
      if (!t) { router.replace("/auth"); return; }
      setToken(t);
    });
  }, [router]);

  // ── Load users ────────────────────────────────────────────────────────────
  const loadUsers = useCallback(async (tok: string) => {
    setUsersLoading(true);
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    if (res.status === 401) { setAccessDenied(true); setUsersLoading(false); return; }
    const data = await res.json();
    setUsers(data.users ?? []);
    setUsersLoading(false);
  }, []);

  // ── Load plans ────────────────────────────────────────────────────────────
  const loadPlans = useCallback(async (tok: string) => {
    setPlansLoading(true);
    const res = await fetch("/api/admin/plans", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    const data = await res.json();
    setPlans(data.plans ?? []);
    setPlansLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;
    loadUsers(token);
    loadPlans(token);
  }, [token, loadUsers, loadPlans]);

  // ── Delete user ───────────────────────────────────────────────────────────
  async function handleDeleteUser() {
    if (!deletingUser || !token) return;
    setDeletingUserLoading(true);
    await fetch(`/api/admin/users/${deletingUser.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeletingUserLoading(false);
    setDeletingUser(null);
    loadUsers(token);
    loadPlans(token);
  }

  // ── Delete plan ───────────────────────────────────────────────────────────
  async function handleDeletePlan() {
    if (!deletingPlan || !token) return;
    setDeletingPlanLoading(true);
    await fetch(`/api/admin/plans/${deletingPlan.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeletingPlanLoading(false);
    setDeletingPlan(null);
    loadPlans(token);
  }

  // ── Toggle plan active ────────────────────────────────────────────────────
  async function handleToggleActive(plan: AdminPlan) {
    if (!token) return;
    await fetch(`/api/admin/plans/${plan.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ activo: !plan.activo }),
    });
    loadPlans(token);
  }

  // ── Filtered plans ────────────────────────────────────────────────────────
  const filteredPlans = filterUserId
    ? plans.filter((p) => p.user_id === filterUserId)
    : plans;

  // ── Render: access denied ─────────────────────────────────────────────────
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center px-5">
        <div className="text-center">
          <p className="font-condensed text-2xl font-bold text-negro tracking-wide mb-2">ACCESO RESTRINGIDO</p>
          <p className="text-negro/50 text-sm mb-6">Esta sección es solo para administradores.</p>
          <button onClick={() => router.push("/")}
            className="bg-negro text-blanco font-condensed font-bold px-6 py-3 rounded-xl hover:bg-negro/80 transition-colors tracking-wide">
            VOLVER
          </button>
        </div>
      </div>
    );
  }

  // ── Render: loading ───────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-3 h-3 bg-lila rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Render: main ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-crema">
      {/* Header */}
      <header className="bg-blanco border-b border-negro/10">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")}
              className="text-negro/40 hover:text-negro font-condensed text-sm tracking-wide transition-colors">
              ← VOLVER
            </button>
            <span className="text-negro/20">|</span>
            <span className="font-condensed font-bold text-negro tracking-wide text-sm">PANEL DE ADMINISTRACIÓN</span>
          </div>
          <span className="font-condensed text-xs font-bold text-lila tracking-widest uppercase bg-lila-light px-3 py-1 rounded-full">Admin</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-blanco border border-negro/10 rounded-xl p-1 mb-6 w-fit">
          {(["usuarios", "entrenamientos"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-condensed font-bold text-sm tracking-widest uppercase transition-all ${
                tab === t ? "bg-negro text-blanco" : "text-negro/40 hover:text-negro"
              }`}>
              {t === "usuarios" ? `Usuarios (${users.length})` : `Entrenamientos (${plans.length})`}
            </button>
          ))}
        </div>

        {/* ── TAB: USUARIOS ─────────────────────────────────────────────────── */}
        {tab === "usuarios" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-condensed text-lg font-bold text-negro tracking-wide">USUARIOS</h2>
              <button onClick={() => setShowNewUser(true)}
                className="bg-negro text-blanco font-condensed font-bold text-sm px-4 py-2 rounded-xl hover:bg-negro/80 transition-colors tracking-wide">
                + NUEVO USUARIO
              </button>
            </div>

            {usersLoading ? (
              <div className="flex gap-2 py-12 justify-center">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-2.5 h-2.5 bg-lila rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            ) : users.length === 0 ? (
              <p className="text-negro/40 text-sm text-center py-12">No hay usuarios registrados.</p>
            ) : (
              <div className="bg-blanco border border-negro/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-negro/8 bg-crema">
                        <th className="text-left px-4 py-3 font-condensed text-xs text-negro/50 tracking-widest uppercase">Nombre</th>
                        <th className="text-left px-4 py-3 font-condensed text-xs text-negro/50 tracking-widest uppercase">Email</th>
                        <th className="text-left px-4 py-3 font-condensed text-xs text-negro/50 tracking-widest uppercase">Rol</th>
                        <th className="text-left px-4 py-3 font-condensed text-xs text-negro/50 tracking-widest uppercase">Registro</th>
                        <th className="text-left px-4 py-3 font-condensed text-xs text-negro/50 tracking-widest uppercase">Último acceso</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-negro/5">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-crema/50 transition-colors">
                          <td className="px-4 py-3.5 text-negro font-medium">
                            {[u.nombre, u.apellidos].filter(Boolean).join(" ") || <span className="text-negro/30 italic">Sin nombre</span>}
                          </td>
                          <td className="px-4 py-3.5 text-negro/60">{u.email}</td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-condensed font-bold tracking-wide ${
                              u.role === "admin" ? "bg-lila-light text-lila-dark" : "bg-negro/5 text-negro/50"
                            }`}>
                              {u.role === "admin" ? "ADMIN" : "USUARIO"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-negro/50 text-xs">{fmtDate(u.created_at)}</td>
                          <td className="px-4 py-3.5 text-negro/50 text-xs">{fmtDate(u.last_sign_in_at)}</td>
                          <td className="px-4 py-3.5 text-right">
                            {u.role !== "admin" && (
                              <button onClick={() => setDeletingUser(u)}
                                className="text-xs text-red-400 hover:text-red-600 font-condensed font-bold tracking-wide transition-colors">
                                Eliminar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: ENTRENAMIENTOS ───────────────────────────────────────────── */}
        {tab === "entrenamientos" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-condensed text-lg font-bold text-negro tracking-wide">ENTRENAMIENTOS</h2>
              <div className="flex items-center gap-3">
                <select value={filterUserId} onChange={e => setFilterUserId(e.target.value)}
                  className="border border-negro/15 rounded-xl px-3 py-2 text-sm bg-blanco text-negro focus:outline-none focus:border-lila/60 focus:ring-1 focus:ring-lila/30">
                  <option value="">Todos los usuarios</option>
                  {users.filter(u => u.role !== "admin").map(u => (
                    <option key={u.id} value={u.id}>{userLabel(u)}</option>
                  ))}
                </select>
                <button
                  onClick={() => { setEditingPlan(null); setShowPlanModal(true); }}
                  className="bg-negro text-blanco font-condensed font-bold text-sm px-4 py-2 rounded-xl hover:bg-negro/80 transition-colors tracking-wide whitespace-nowrap">
                  + NUEVO PLAN
                </button>
              </div>
            </div>

            {plansLoading ? (
              <div className="flex gap-2 py-12 justify-center">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-2.5 h-2.5 bg-lila rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            ) : filteredPlans.length === 0 ? (
              <p className="text-negro/40 text-sm text-center py-12">No hay planes de entrenamiento.</p>
            ) : (
              <div className="bg-blanco border border-negro/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-negro/8 bg-crema">
                        <th className="text-left px-4 py-3 font-condensed text-xs text-negro/50 tracking-widest uppercase">Usuario</th>
                        <th className="text-left px-4 py-3 font-condensed text-xs text-negro/50 tracking-widest uppercase">Título</th>
                        <th className="text-left px-4 py-3 font-condensed text-xs text-negro/50 tracking-widest uppercase">Semanas</th>
                        <th className="text-left px-4 py-3 font-condensed text-xs text-negro/50 tracking-widest uppercase">Estado</th>
                        <th className="text-left px-4 py-3 font-condensed text-xs text-negro/50 tracking-widest uppercase">Creado</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-negro/5">
                      {filteredPlans.map((p) => (
                        <tr key={p.id} className="hover:bg-crema/50 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="text-negro font-medium text-sm">
                              {userLabel({ nombre: p.user_nombre, apellidos: p.user_apellidos, email: p.user_email ?? "" })}
                            </div>
                            <div className="text-negro/40 text-xs">{p.user_email}</div>
                          </td>
                          <td className="px-4 py-3.5 text-negro">{p.titulo}</td>
                          <td className="px-4 py-3.5 text-negro/60">{p.plan_data?.totalSemanas ?? "—"}</td>
                          <td className="px-4 py-3.5">
                            <button onClick={() => handleToggleActive(p)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-condensed font-bold tracking-wide transition-colors ${
                                p.activo
                                  ? "bg-lila-light text-lila-dark hover:bg-lila/20"
                                  : "bg-negro/5 text-negro/40 hover:bg-negro/10"
                              }`}>
                              {p.activo ? "Activo" : "Inactivo"}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-negro/50 text-xs">{fmtDate(p.created_at)}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3 justify-end">
                              <button
                                onClick={() => { setEditingPlan(p); setShowPlanModal(true); }}
                                className="text-xs text-lila-dark hover:text-lila font-condensed font-bold tracking-wide transition-colors">
                                Editar
                              </button>
                              <button onClick={() => setDeletingPlan(p)}
                                className="text-xs text-red-400 hover:text-red-600 font-condensed font-bold tracking-wide transition-colors">
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewUser && token && (
        <NewUserModal
          token={token}
          onClose={() => setShowNewUser(false)}
          onCreated={() => loadUsers(token)}
        />
      )}

      {showPlanModal && token && (
        <PlanModal
          plan={editingPlan}
          users={users}
          token={token}
          onClose={() => { setShowPlanModal(false); setEditingPlan(null); }}
          onSaved={() => loadPlans(token)}
        />
      )}

      {deletingUser && (
        <ConfirmDialog
          message={`¿Eliminar al usuario ${userLabel(deletingUser)} (${deletingUser.email})? Esta acción es irreversible y borrará todos sus datos.`}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeletingUser(null)}
          loading={deletingUserLoading}
        />
      )}

      {deletingPlan && (
        <ConfirmDialog
          message={`¿Eliminar el plan "${deletingPlan.titulo}"? Se perderán también las sesiones completadas asociadas.`}
          onConfirm={handleDeletePlan}
          onCancel={() => setDeletingPlan(null)}
          loading={deletingPlanLoading}
        />
      )}
    </div>
  );
}
