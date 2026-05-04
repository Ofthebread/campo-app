"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

type Section = "dashboard" | "usuarios" | "planes";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IcGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function IcUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IcPlan() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function IcSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IcDots() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}
function IcX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IcArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
function IcMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtRelative(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  return fmtDate(iso);
}

function userLabel(u: { nombre: string | null; apellidos: string | null; email: string }) {
  return [u.nombre, u.apellidos].filter(Boolean).join(" ") || u.email;
}

function initials(nombre: string | null, apellidos: string | null, email: string) {
  if (nombre && apellidos) return `${nombre[0]}${apellidos[0]}`.toUpperCase();
  if (nombre) return nombre.slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

const AVATAR_PALETTE = [
  "bg-[#9B8EC4] text-white",
  "bg-[#6366f1] text-white",
  "bg-[#0d9488] text-white",
  "bg-[#d97706] text-white",
  "bg-[#e11d48] text-white",
  "bg-[#0284c7] text-white",
];

function avatarClass(str: string) {
  return AVATAR_PALETTE[str.charCodeAt(0) % AVATAR_PALETTE.length];
}

const PLAN_TEMPLATE: PlanEntrenamiento = {
  titulo: "Plan personalizado",
  objetivo: "forma_fisica",
  nivel: "algo_activo",
  totalSemanas: 4,
  semanas: [{
    numero: 1,
    descripcion: "Semana de adaptación",
    objetivoSemana: "Acostumbrar el cuerpo al ritmo de entrenamiento",
    sesiones: [{
      dia: "Lunes",
      tipo: "carrera",
      duracion: 30,
      calentamiento: "5 min caminata rápida",
      ejercicios: [{
        nombre: "Carrera continua",
        duracion: "20 min",
        descripcion: "Ritmo cómodo",
        series: null,
        repeticiones: null,
        descanso: null,
      }],
      vueltaCalma: "5 min caminata + estiramientos",
      consejos: "No te pases de ritmo",
    }],
  }],
  consejosGenerales: ["Hidratación constante"],
  nutricion: ["Carbohidratos antes del entreno"],
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  nombre, apellidos, email, size = "md",
}: { nombre: string | null; apellidos: string | null; email: string; size?: "sm" | "md" | "lg" }) {
  const ini = initials(nombre, apellidos, email);
  const cls = avatarClass(email);
  const sz = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-11 h-11 text-sm" : "w-9 h-9 text-xs";
  return (
    <div className={`${sz} ${cls} rounded-full flex items-center justify-center font-bold flex-shrink-0`}>
      {ini}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: number | string; sub: string }) {
  return (
    <div className="bg-blanco rounded-2xl border border-negro/8 p-5 flex flex-col gap-2">
      <p className="text-negro/40 text-xs font-condensed tracking-widest uppercase">{label}</p>
      <p className="font-condensed text-4xl font-bold text-negro tracking-tight leading-none">{value}</p>
      <p className="text-negro/40 text-xs">{sub}</p>
    </div>
  );
}

// ─── Three-dot action menu ────────────────────────────────────────────────────

function ActionMenu({ items }: { items: { label: string; danger?: boolean; onClick: () => void }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-negro/30 hover:text-negro hover:bg-negro/6 transition-colors"
      >
        <IcDots />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-30 w-44 bg-blanco border border-negro/10 rounded-xl shadow-lg py-1 overflow-hidden">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => { item.onClick(); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                item.danger
                  ? "text-red-500 hover:bg-red-50"
                  : "text-negro hover:bg-crema"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  section, setSection, userCount, planCount, router, mobile, onClose,
}: {
  section: Section;
  setSection: (s: Section) => void;
  userCount: number;
  planCount: number;
  router: ReturnType<typeof useRouter>;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const nav: { key: Section; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "dashboard", label: "Dashboard", icon: <IcGrid /> },
    { key: "usuarios", label: "Usuarios", icon: <IcUsers />, count: userCount },
    { key: "planes", label: "Entrenamientos", icon: <IcPlan />, count: planCount },
  ];

  function handleNav(key: Section) {
    setSection(key);
    onClose?.();
  }

  return (
    <div className={`flex flex-col h-full bg-[#1A1A1A] ${mobile ? "w-full" : "w-[220px]"}`}>
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-lila rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-condensed font-bold text-sm tracking-widest">CAMPO APP</p>
            <p className="text-lila text-[10px] font-condensed tracking-widest uppercase">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ key, label, icon, count }) => {
          const active = section === key;
          return (
            <button
              key={key}
              onClick={() => handleNav(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                active
                  ? "bg-white/12 text-white"
                  : "text-white/45 hover:text-white/80 hover:bg-white/6"
              }`}
            >
              <span className={active ? "text-lila" : ""}>{icon}</span>
              <span className="flex-1 text-left font-medium">{label}</span>
              {count !== undefined && count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  active ? "bg-lila/30 text-lila" : "bg-white/10 text-white/40"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-white/8">
        <button
          onClick={() => router.push("/")}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/35 hover:text-white/70 hover:bg-white/6 transition-all text-sm"
        >
          <IcArrowLeft />
          <span>Volver a la app</span>
        </button>
      </div>
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function Drawer({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-negro/40 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      {/* Panel */}
      <div className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-blanco flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-negro/8">
          <h2 className="font-condensed font-bold text-negro text-xl tracking-wide">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-negro/40 hover:text-negro hover:bg-negro/6 transition-colors">
            <IcX />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

// ─── New user drawer ──────────────────────────────────────────────────────────

function NewUserDrawer({ open, onClose, onCreated, token }: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  token: string;
}) {
  const [form, setForm] = useState({ email: "", nombre: "", apellidos: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!open) { setForm({ email: "", nombre: "", apellidos: "", password: "" }); setError(null); } }, [open]);

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

  const field = "w-full border border-negro/12 rounded-xl px-4 py-3 text-sm bg-crema text-negro placeholder-negro/25 focus:outline-none focus:border-lila/50 focus:ring-2 focus:ring-lila/15 transition-all";

  return (
    <Drawer open={open} onClose={onClose} title="Nuevo usuario">
      <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5 h-full">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-condensed font-bold text-negro/50 tracking-widest uppercase">Nombre</label>
            <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className={field} placeholder="Ana" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-condensed font-bold text-negro/50 tracking-widest uppercase">Apellidos</label>
            <input value={form.apellidos} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))} className={field} placeholder="García" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-condensed font-bold text-negro/50 tracking-widest uppercase">Email *</label>
          <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={field} placeholder="ana@ejemplo.com" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-condensed font-bold text-negro/50 tracking-widest uppercase">Contraseña inicial *</label>
          <input type="password" required minLength={8} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={field} placeholder="Mínimo 8 caracteres" />
          <p className="text-[11px] text-negro/35">El usuario podrá cambiarla desde su perfil.</p>
        </div>
        <div className="mt-auto pt-4 border-t border-negro/8">
          <button type="submit" disabled={loading}
            className="w-full bg-negro text-blanco font-condensed font-bold py-3.5 rounded-xl hover:bg-negro/80 transition-colors disabled:opacity-50 tracking-wide">
            {loading ? "Creando..." : "Crear usuario"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}

// ─── Plan drawer ──────────────────────────────────────────────────────────────

function PlanDrawer({ open, plan, users, onClose, onSaved, token }: {
  open: boolean;
  plan: AdminPlan | null;
  users: AdminUser[];
  onClose: () => void;
  onSaved: () => void;
  token: string;
}) {
  const isEdit = !!plan;
  const [titulo, setTitulo] = useState("");
  const [userId, setUserId] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitulo(plan?.titulo ?? "");
      setUserId(plan?.user_id ?? "");
      setJsonText(plan ? JSON.stringify(plan.plan_data, null, 2) : JSON.stringify(PLAN_TEMPLATE, null, 2));
      setJsonError(null);
      setError(null);
    }
  }, [open, plan]);

  function validateJson() {
    try { JSON.parse(jsonText); setJsonError(null); return true; }
    catch { setJsonError("JSON inválido"); return false; }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateJson()) return;
    if (!userId && !isEdit) { setError("Selecciona un usuario"); return; }
    setError(null);
    setLoading(true);
    const planData = JSON.parse(jsonText);
    const url = isEdit ? `/api/admin/plans/${plan!.id}` : "/api/admin/plans";
    const method = isEdit ? "PUT" : "POST";
    const body = isEdit ? { titulo, plan_data: planData } : { user_id: userId, titulo, plan_data: planData };
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
    onSaved();
    onClose();
  }

  const field = "w-full border border-negro/12 rounded-xl px-4 py-3 text-sm bg-crema text-negro placeholder-negro/25 focus:outline-none focus:border-lila/50 focus:ring-2 focus:ring-lila/15 transition-all";

  return (
    <Drawer open={open} onClose={onClose} title={isEdit ? "Editar plan" : "Nuevo plan"}>
      <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

        {!isEdit ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-condensed font-bold text-negro/50 tracking-widest uppercase">Usuario *</label>
            <select value={userId} onChange={e => setUserId(e.target.value)} required className={field}>
              <option value="">Selecciona un usuario...</option>
              {users.filter(u => u.role !== "admin").map(u => (
                <option key={u.id} value={u.id}>{userLabel(u)} — {u.email}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-crema rounded-xl px-4 py-3">
            <Avatar nombre={plan!.user_nombre} apellidos={plan!.user_apellidos} email={plan!.user_email ?? ""} size="sm" />
            <div>
              <p className="text-sm font-medium text-negro">{userLabel({ nombre: plan!.user_nombre, apellidos: plan!.user_apellidos, email: plan!.user_email ?? "" })}</p>
              <p className="text-xs text-negro/40">{plan!.user_email}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-condensed font-bold text-negro/50 tracking-widest uppercase">Título *</label>
          <input required value={titulo} onChange={e => setTitulo(e.target.value)} className={field} placeholder="Ej: Plan 10K — 8 semanas" />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-condensed font-bold text-negro/50 tracking-widest uppercase">Datos del plan (JSON) *</label>
            <button type="button" onClick={() => { setJsonText(JSON.stringify(PLAN_TEMPLATE, null, 2)); setJsonError(null); }}
              className="text-[11px] text-lila hover:text-lila-dark transition-colors font-medium">
              Cargar plantilla
            </button>
          </div>
          <textarea
            value={jsonText}
            onChange={e => { setJsonText(e.target.value); setJsonError(null); }}
            onBlur={validateJson}
            rows={16}
            spellCheck={false}
            className={`w-full border rounded-xl px-4 py-3 text-[11px] font-mono bg-[#1A1A1A] text-green-300 focus:outline-none focus:ring-2 transition-all resize-none ${
              jsonError ? "border-red-400 focus:ring-red-200" : "border-negro/12 focus:border-lila/50 focus:ring-lila/15"
            }`}
          />
          {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
        </div>

        <div className="pb-4">
          <button type="submit" disabled={loading}
            className="w-full bg-negro text-blanco font-condensed font-bold py-3.5 rounded-xl hover:bg-negro/80 transition-colors disabled:opacity-50 tracking-wide">
            {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear plan"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

function Confirm({ message, onConfirm, onCancel, loading }: {
  message: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-negro/50 backdrop-blur-[2px] px-4">
      <div className="w-full max-w-sm bg-blanco border border-negro/10 rounded-2xl p-6 shadow-xl">
        <p className="text-negro text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 border border-negro/12 text-negro/60 font-condensed font-bold text-sm py-3 rounded-xl hover:bg-negro/4 transition-colors tracking-wide">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 bg-red-500 text-white font-condensed font-bold text-sm py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 tracking-wide">
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard section ────────────────────────────────────────────────────────

function DashboardSection({ users, plans }: { users: AdminUser[]; plans: AdminPlan[] }) {
  const activePlans = plans.filter(p => p.activo).length;
  const verified = users.filter(u => u.email_confirmed_at).length;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newThisWeek = users.filter(u => new Date(u.created_at).getTime() > sevenDaysAgo).length;

  const recentUsers = [...users].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const recentPlans = [...plans].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Usuarios" value={users.length} sub="registrados en total" />
        <StatCard label="Planes activos" value={activePlans} sub="en curso ahora" />
        <StatCard label="Verificados" value={verified} sub="email confirmado" />
        <StatCard label="Esta semana" value={newThisWeek} sub="nuevos registros" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent users */}
        <div className="bg-blanco rounded-2xl border border-negro/8 overflow-hidden">
          <div className="px-5 py-4 border-b border-negro/6">
            <p className="font-condensed font-bold text-negro text-sm tracking-wide">ÚLTIMOS USUARIOS</p>
          </div>
          <div className="divide-y divide-negro/5">
            {recentUsers.length === 0 ? (
              <p className="text-negro/30 text-sm text-center py-8">Sin usuarios aún</p>
            ) : recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                <Avatar nombre={u.nombre} apellidos={u.apellidos} email={u.email} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-negro truncate">{userLabel(u)}</p>
                  <p className="text-xs text-negro/40 truncate">{u.email}</p>
                </div>
                <span className="text-xs text-negro/30 flex-shrink-0">{fmtRelative(u.created_at)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent plans */}
        <div className="bg-blanco rounded-2xl border border-negro/8 overflow-hidden">
          <div className="px-5 py-4 border-b border-negro/6">
            <p className="font-condensed font-bold text-negro text-sm tracking-wide">ÚLTIMOS PLANES</p>
          </div>
          <div className="divide-y divide-negro/5">
            {recentPlans.length === 0 ? (
              <p className="text-negro/30 text-sm text-center py-8">Sin planes aún</p>
            ) : recentPlans.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                <Avatar nombre={p.user_nombre} apellidos={p.user_apellidos} email={p.user_email ?? ""} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-negro truncate">{p.titulo}</p>
                  <p className="text-xs text-negro/40 truncate">{userLabel({ nombre: p.user_nombre, apellidos: p.user_apellidos, email: p.user_email ?? "" })}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.activo && <span className="w-1.5 h-1.5 rounded-full bg-lila" />}
                  <span className="text-xs text-negro/30">{fmtRelative(p.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Users section ────────────────────────────────────────────────────────────

function UsersSection({
  users, loading, onNew, onDelete,
}: {
  users: AdminUser[];
  loading: boolean;
  onNew: () => void;
  onDelete: (u: AdminUser) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = users.filter(u =>
    `${u.nombre} ${u.apellidos} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-negro/30"><IcSearch /></span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-4 py-2.5 bg-blanco border border-negro/10 rounded-xl text-sm text-negro placeholder-negro/30 focus:outline-none focus:border-lila/50 focus:ring-2 focus:ring-lila/15 transition-all"
          />
        </div>
        <button onClick={onNew}
          className="bg-negro text-blanco font-condensed font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-negro/80 transition-colors tracking-wide whitespace-nowrap flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Nuevo usuario
        </button>
      </div>

      {/* Table */}
      <div className="bg-blanco rounded-2xl border border-negro/8 overflow-hidden">
        {loading ? (
          <div className="flex gap-2 justify-center py-16">
            {[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-lila rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-negro/20 text-4xl mb-3">◯</p>
            <p className="text-negro/40 text-sm">{search ? "Sin resultados" : "No hay usuarios aún"}</p>
          </div>
        ) : (
          <div className="divide-y divide-negro/5">
            {filtered.map(u => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-4 hover:bg-crema/60 transition-colors group">
                <Avatar nombre={u.nombre} apellidos={u.apellidos} email={u.email} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-negro">
                      {[u.nombre, u.apellidos].filter(Boolean).join(" ") || <span className="text-negro/30 font-normal italic">Sin nombre</span>}
                    </p>
                    {u.role === "admin" && (
                      <span className="text-[10px] font-condensed font-bold tracking-widest text-lila-dark bg-lila-light px-2 py-0.5 rounded-full uppercase">Admin</span>
                    )}
                  </div>
                  <p className="text-xs text-negro/40 truncate">{u.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${u.email_confirmed_at ? "bg-emerald-400" : "bg-negro/20"}`} />
                  <span className="text-xs text-negro/40">{u.email_confirmed_at ? "Verificado" : "Sin verificar"}</span>
                </div>
                <div className="hidden sm:block text-xs text-negro/30 flex-shrink-0 w-20 text-right">
                  {fmtRelative(u.created_at)}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {u.role !== "admin" ? (
                    <ActionMenu items={[{ label: "Eliminar usuario", danger: true, onClick: () => onDelete(u) }]} />
                  ) : <div className="w-7" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Plans section ────────────────────────────────────────────────────────────

function PlansSection({
  plans, users, loading, onNew, onEdit, onDelete, onToggle,
}: {
  plans: AdminPlan[];
  users: AdminUser[];
  loading: boolean;
  onNew: () => void;
  onEdit: (p: AdminPlan) => void;
  onDelete: (p: AdminPlan) => void;
  onToggle: (p: AdminPlan) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterUser, setFilterUser] = useState("");

  const filtered = plans.filter(p => {
    const matchUser = !filterUser || p.user_id === filterUser;
    const q = search.toLowerCase();
    const matchSearch = !q || p.titulo.toLowerCase().includes(q) ||
      `${p.user_nombre} ${p.user_apellidos} ${p.user_email}`.toLowerCase().includes(q);
    return matchUser && matchSearch;
  });

  const usersWithPlans = users.filter(u => u.role !== "admin" && plans.some(p => p.user_id === u.id));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 relative min-w-[180px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-negro/30"><IcSearch /></span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar plan o usuario..."
            className="w-full pl-10 pr-4 py-2.5 bg-blanco border border-negro/10 rounded-xl text-sm text-negro placeholder-negro/30 focus:outline-none focus:border-lila/50 focus:ring-2 focus:ring-lila/15 transition-all"
          />
        </div>
        <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
          className="border border-negro/10 rounded-xl px-3 py-2.5 text-sm bg-blanco text-negro focus:outline-none focus:border-lila/50 focus:ring-2 focus:ring-lila/15 transition-all">
          <option value="">Todos los usuarios</option>
          {usersWithPlans.map(u => (
            <option key={u.id} value={u.id}>{userLabel(u)}</option>
          ))}
        </select>
        <button onClick={onNew}
          className="bg-negro text-blanco font-condensed font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-negro/80 transition-colors tracking-wide whitespace-nowrap flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Nuevo plan
        </button>
      </div>

      {/* Table */}
      <div className="bg-blanco rounded-2xl border border-negro/8 overflow-hidden">
        {loading ? (
          <div className="flex gap-2 justify-center py-16">
            {[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-lila rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-negro/20 text-4xl mb-3">◯</p>
            <p className="text-negro/40 text-sm">{search || filterUser ? "Sin resultados" : "No hay planes aún"}</p>
          </div>
        ) : (
          <div className="divide-y divide-negro/5">
            {filtered.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-crema/60 transition-colors group">
                <Avatar nombre={p.user_nombre} apellidos={p.user_apellidos} email={p.user_email ?? ""} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-negro truncate">{p.titulo}</p>
                  <p className="text-xs text-negro/40 truncate">
                    {userLabel({ nombre: p.user_nombre, apellidos: p.user_apellidos, email: p.user_email ?? "" })}
                    {" · "}{p.plan_data?.totalSemanas ?? "?"} semanas
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => onToggle(p)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                      p.activo
                        ? "bg-lila-light text-lila-dark hover:bg-lila/20"
                        : "bg-negro/6 text-negro/40 hover:bg-negro/10"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${p.activo ? "bg-lila" : "bg-negro/30"}`} />
                    {p.activo ? "Activo" : "Inactivo"}
                  </button>
                  <span className="text-xs text-negro/30">{fmtRelative(p.created_at)}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ActionMenu items={[
                    { label: "Editar plan", onClick: () => onEdit(p) },
                    { label: "Eliminar plan", danger: true, onClick: () => onDelete(p) },
                  ]} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("dashboard");
  const [accessDenied, setAccessDenied] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const [showNewUser, setShowNewUser] = useState(false);
  const [showPlanDrawer, setShowPlanDrawer] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deletingUserLoading, setDeletingUserLoading] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<AdminPlan | null>(null);
  const [deletingPlanLoading, setDeletingPlanLoading] = useState(false);

  useEffect(() => {
    getSessionToken().then(t => {
      if (!t) { router.replace("/auth"); return; }
      setToken(t);
    });
  }, [router]);

  const loadUsers = useCallback(async (tok: string) => {
    setUsersLoading(true);
    const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${tok}` } });
    if (res.status === 401) { setAccessDenied(true); setUsersLoading(false); return; }
    const data = await res.json();
    setUsers(data.users ?? []);
    setUsersLoading(false);
  }, []);

  const loadPlans = useCallback(async (tok: string) => {
    setPlansLoading(true);
    const res = await fetch("/api/admin/plans", { headers: { Authorization: `Bearer ${tok}` } });
    const data = await res.json();
    setPlans(data.plans ?? []);
    setPlansLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;
    loadUsers(token);
    loadPlans(token);
  }, [token, loadUsers, loadPlans]);

  async function handleDeleteUser() {
    if (!deletingUser || !token) return;
    setDeletingUserLoading(true);
    await fetch(`/api/admin/users/${deletingUser.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setDeletingUserLoading(false);
    setDeletingUser(null);
    loadUsers(token);
    loadPlans(token);
  }

  async function handleDeletePlan() {
    if (!deletingPlan || !token) return;
    setDeletingPlanLoading(true);
    await fetch(`/api/admin/plans/${deletingPlan.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setDeletingPlanLoading(false);
    setDeletingPlan(null);
    loadPlans(token);
  }

  async function handleToggleActive(p: AdminPlan) {
    if (!token) return;
    await fetch(`/api/admin/plans/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ activo: !p.activo }),
    });
    loadPlans(token);
  }

  const sectionTitle: Record<Section, string> = {
    dashboard: "Dashboard",
    usuarios: "Usuarios",
    planes: "Entrenamientos",
  };

  if (accessDenied) return (
    <div className="min-h-screen bg-crema flex items-center justify-center px-5">
      <div className="text-center">
        <p className="font-condensed text-2xl font-bold text-negro tracking-wide mb-2">Acceso restringido</p>
        <p className="text-negro/50 text-sm mb-6">Esta sección es solo para administradores.</p>
        <button onClick={() => router.push("/")} className="bg-negro text-blanco font-condensed font-bold px-6 py-3 rounded-xl hover:bg-negro/80 transition-colors tracking-wide">Volver</button>
      </div>
    </div>
  );

  if (!token) return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
      <div className="flex gap-2">
        {[0,1,2].map(i => <span key={i} className="w-3 h-3 bg-lila rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-crema overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-[220px] flex-shrink-0">
        <Sidebar section={section} setSection={setSection} userCount={users.length} planCount={plans.length} router={router} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div onClick={() => setMobileSidebar(false)} className="absolute inset-0 bg-negro/50" />
          <div className="relative w-[240px] flex">
            <Sidebar section={section} setSection={s => { setSection(s); setMobileSidebar(false); }} userCount={users.length} planCount={plans.length} router={router} mobile onClose={() => setMobileSidebar(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-5 md:px-8 h-14 bg-crema border-b border-negro/8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebar(true)} className="md:hidden text-negro/50 hover:text-negro">
              <IcMenu />
            </button>
            <h1 className="font-condensed font-bold text-negro text-lg tracking-wide">{sectionTitle[section]}</h1>
          </div>
          {section === "usuarios" && (
            <button onClick={() => setShowNewUser(true)}
              className="bg-negro text-blanco font-condensed font-bold text-sm px-4 py-2 rounded-xl hover:bg-negro/80 transition-colors tracking-wide flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Nuevo usuario
            </button>
          )}
          {section === "planes" && (
            <button onClick={() => { setEditingPlan(null); setShowPlanDrawer(true); }}
              className="bg-negro text-blanco font-condensed font-bold text-sm px-4 py-2 rounded-xl hover:bg-negro/80 transition-colors tracking-wide flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Nuevo plan
            </button>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-5 md:px-8 py-6">
          {section === "dashboard" && <DashboardSection users={users} plans={plans} />}
          {section === "usuarios" && (
            <UsersSection
              users={users}
              loading={usersLoading}
              onNew={() => setShowNewUser(true)}
              onDelete={u => setDeletingUser(u)}
            />
          )}
          {section === "planes" && (
            <PlansSection
              plans={plans}
              users={users}
              loading={plansLoading}
              onNew={() => { setEditingPlan(null); setShowPlanDrawer(true); }}
              onEdit={p => { setEditingPlan(p); setShowPlanDrawer(true); }}
              onDelete={p => setDeletingPlan(p)}
              onToggle={handleToggleActive}
            />
          )}
        </main>
      </div>

      {/* Drawers */}
      {token && (
        <>
          <NewUserDrawer open={showNewUser} onClose={() => setShowNewUser(false)} onCreated={() => loadUsers(token)} token={token} />
          <PlanDrawer
            open={showPlanDrawer}
            plan={editingPlan}
            users={users}
            token={token}
            onClose={() => { setShowPlanDrawer(false); setEditingPlan(null); }}
            onSaved={() => loadPlans(token)}
          />
        </>
      )}

      {deletingUser && (
        <Confirm
          message={`¿Eliminar a ${userLabel(deletingUser)}? Esta acción borrará su cuenta y todos sus datos de forma permanente.`}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeletingUser(null)}
          loading={deletingUserLoading}
        />
      )}
      {deletingPlan && (
        <Confirm
          message={`¿Eliminar el plan "${deletingPlan.titulo}"? Se perderán también las sesiones completadas.`}
          onConfirm={handleDeletePlan}
          onCancel={() => setDeletingPlan(null)}
          loading={deletingPlanLoading}
        />
      )}
    </div>
  );
}
