"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  getProfile,
  updateProfile,
  getAllPlans,
  setActivePlan,
  deletePlan,
  type ProfileData,
  type PlanResumen,
} from "@/lib/db";

// ─── validation ───────────────────────────────────────────────────────────────

const PHONE_REGEX = /^[+\d][\d\s\-(). ]{6,}$/;

type FieldErrors = Partial<Record<string, string>>;

function validateProfile(fields: {
  nombre: string;
  apellidos: string;
  telefono: string;
  fechaNacimiento: string;
  pesoKg: string;
  alturaCm: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (fields.nombre.trim() && fields.nombre.trim().length < 2)
    errors.nombre = "Mínimo 2 caracteres";

  if (fields.apellidos.trim() && fields.apellidos.trim().length < 2)
    errors.apellidos = "Mínimo 2 caracteres";

  if (fields.telefono.trim() && !PHONE_REGEX.test(fields.telefono.trim()))
    errors.telefono = "Introduce un teléfono válido (ej: +34 600 000 000)";

  if (fields.fechaNacimiento) {
    const dob = new Date(fields.fechaNacimiento);
    const now = new Date();
    const ageYears = (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (dob > now)
      errors.fechaNacimiento = "La fecha no puede ser futura";
    else if (ageYears < 10)
      errors.fechaNacimiento = "Debes tener al menos 10 años";
    else if (ageYears > 100)
      errors.fechaNacimiento = "Introduce una fecha válida";
  }

  if (fields.pesoKg) {
    const v = Number(fields.pesoKg);
    if (isNaN(v) || v < 30 || v > 300)
      errors.pesoKg = "Entre 30 y 300 kg";
  }

  if (fields.alturaCm) {
    const v = Number(fields.alturaCm);
    if (isNaN(v) || v < 100 || v > 250)
      errors.alturaCm = "Entre 100 y 250 cm";
  }

  return errors;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-condensed text-xs font-semibold text-lila mb-1.5 tracking-widest uppercase">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  error,
}: {
  value: string;
  onChange?: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full bg-crema border rounded-xl px-4 py-3 text-negro placeholder-negro/20 text-sm focus:outline-none focus:ring-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        error
          ? "border-red-500/60 focus:border-red-500/80 focus:ring-red-500/20"
          : "border-negro/10 focus:border-lila/50 focus:ring-lila/20"
      }`}
    />
  );
}

function NumberInput({
  value,
  onChange,
  onBlur,
  placeholder,
  suffix,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  suffix?: string;
  error?: string;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full bg-crema border rounded-xl px-4 py-3 text-negro placeholder-negro/20 text-sm focus:outline-none focus:ring-1 transition-colors pr-12 ${
          error
            ? "border-red-500/60 focus:border-red-500/80 focus:ring-red-500/20"
            : "border-negro/10 focus:border-lila/50 focus:ring-lila/20"
        }`}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-negro/30 text-sm pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

// ─── plan card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  onActivate,
  onDelete,
}: {
  plan: PlanResumen;
  onActivate: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activating, setActivating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const totalSesiones =
    plan.plan_data.semanas?.reduce((acc, s) => acc + s.sesiones.length, 0) ?? 0;

  async function handleActivate() {
    setActivating(true);
    try {
      await onActivate();
    } finally {
      setActivating(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        plan.activo
          ? "border-lila/40 bg-lila/5"
          : "border-negro/10 bg-crema"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {plan.activo && (
              <span className="text-[10px] font-condensed font-bold tracking-widest text-negro bg-lila px-2 py-0.5 rounded-full uppercase">
                Activo
              </span>
            )}
            <span className="text-negro/30 text-xs">{formatDate(plan.created_at)}</span>
          </div>
          <p className="font-condensed font-bold text-negro text-base tracking-wide leading-tight truncate">
            {plan.titulo}
          </p>
          <p className="text-negro/40 text-xs mt-1">
            {plan.plan_data.totalSemanas} semanas · {totalSesiones} sesiones · Nivel{" "}
            {plan.plan_data.nivel}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        {!plan.activo && (
          <button
            onClick={handleActivate}
            disabled={activating}
            className="flex-1 py-2 rounded-xl border border-lila/40 text-lila font-condensed font-bold text-sm tracking-wide hover:bg-lila/10 transition-colors disabled:opacity-50"
          >
            {activating ? "..." : "ACTIVAR"}
          </button>
        )}
        {confirmDelete ? (
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
              className="flex-1 py-2 rounded-xl border border-negro/20 text-negro/50 font-condensed font-bold text-sm tracking-wide hover:border-negro/40 transition-colors disabled:opacity-50"
            >
              CANCELAR
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-condensed font-bold text-sm tracking-wide hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              {deleting ? "..." : "CONFIRMAR"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className={`py-2 px-4 rounded-xl border border-negro/10 text-negro/30 font-condensed font-bold text-sm tracking-wide hover:border-red-500/40 hover:text-red-400 transition-colors ${
              plan.activo ? "flex-1" : ""
            }`}
          >
            ELIMINAR
          </button>
        )}
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

type Tab = "datos" | "programas";

export default function PerfilPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("datos");

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [genero, setGenero] = useState("");
  const [pesoKg, setPesoKg] = useState("");
  const [alturaCm, setAlturaCm] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [pais, setPais] = useState("");

  const [planes, setPlanes] = useState<PlanResumen[]>([]);
  const [planesLoading, setPlanesLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getProfile().then((p) => {
      setProfile(p);
      if (p) {
        setNombre(p.nombre ?? "");
        setApellidos(p.apellidos ?? "");
        setTelefono(p.telefono ?? "");
        setFechaNacimiento(p.fecha_nacimiento ?? "");
        setGenero(p.genero ?? "");
        setPesoKg(p.peso_kg != null ? String(p.peso_kg) : "");
        setAlturaCm(p.altura_cm != null ? String(p.altura_cm) : "");
        setCiudad(p.ciudad ?? "");
        setPais(p.pais ?? "");
      }
      setProfileLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!user || tab !== "programas") return;
    setPlanesLoading(true);
    getAllPlans()
      .then(setPlanes)
      .finally(() => setPlanesLoading(false));
  }, [user, tab]);

  function currentFields() {
    return { nombre, apellidos, telefono, fechaNacimiento, pesoKg, alturaCm };
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validateProfile(currentFields());
    setFieldErrors((prev) => ({ ...prev, [field]: errs[field] }));
  }

  function getError(field: string): string | undefined {
    return touched[field] ? fieldErrors[field] : undefined;
  }

  async function handleSaveProfile() {
    const allTouched = Object.fromEntries(
      ["nombre", "apellidos", "telefono", "fechaNacimiento", "pesoKg", "alturaCm"].map((k) => [k, true])
    );
    setTouched(allTouched);
    const errs = validateProfile(currentFields());
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      await updateProfile({
        nombre: nombre.trim() || undefined,
        apellidos: apellidos.trim() || undefined,
        telefono: telefono.trim() || undefined,
        fecha_nacimiento: fechaNacimiento || undefined,
        genero: genero || undefined,
        peso_kg: pesoKg ? Number(pesoKg) : undefined,
        altura_cm: alturaCm ? Number(alturaCm) : undefined,
        ciudad: ciudad.trim() || undefined,
        pais: pais.trim() || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate(planId: string) {
    await setActivePlan(planId);
    setPlanes((prev) => prev.map((p) => ({ ...p, activo: p.id === planId })));
  }

  async function handleDelete(planId: string) {
    await deletePlan(planId);
    setPlanes((prev) => prev.filter((p) => p.id !== planId));
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-3 h-3 bg-lila rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-crema flex flex-col">
      <div className="max-w-lg mx-auto w-full px-5 py-8 flex-1 flex flex-col">

        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-condensed text-3xl font-bold text-negro tracking-wide">
              MI PERFIL
            </h1>
            <p className="text-negro/40 text-sm">{profile?.email ?? user.email}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-negro/40 hover:text-negro transition-colors text-sm font-condensed tracking-wide"
          >
            ← VOLVER
          </button>
        </div>

        {/* tabs */}
        <div className="flex gap-1 mb-6 bg-blanco rounded-xl p-1">
          {(["datos", "programas"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg font-condensed font-bold text-sm tracking-widest uppercase transition-all ${
                tab === t
                  ? "bg-lila text-negro"
                  : "text-negro/40 hover:text-negro"
              }`}
            >
              {t === "datos" ? "Mis datos" : "Programas"}
            </button>
          ))}
        </div>

        {/* ── tab: datos ── */}
        {tab === "datos" && (
          <div className="flex-1 flex flex-col gap-5">
            <div className="bg-blanco rounded-2xl border border-negro/10 p-5 space-y-4">
              <p className="font-condensed text-xs text-negro/30 tracking-widest uppercase">
                Información personal
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre" error={getError("nombre")}>
                  <TextInput
                    value={nombre}
                    onChange={setNombre}
                    onBlur={() => handleBlur("nombre")}
                    placeholder="Tu nombre"
                    error={getError("nombre")}
                  />
                </Field>
                <Field label="Apellidos" error={getError("apellidos")}>
                  <TextInput
                    value={apellidos}
                    onChange={setApellidos}
                    onBlur={() => handleBlur("apellidos")}
                    placeholder="Tus apellidos"
                    error={getError("apellidos")}
                  />
                </Field>
              </div>

              <Field label="Email">
                <TextInput value={profile?.email ?? user.email ?? ""} disabled />
              </Field>

              <Field label="Teléfono" error={getError("telefono")}>
                <TextInput
                  value={telefono}
                  onChange={setTelefono}
                  onBlur={() => handleBlur("telefono")}
                  placeholder="+34 600 000 000"
                  error={getError("telefono")}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Fecha de nacimiento" error={getError("fechaNacimiento")}>
                  <input
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    onBlur={() => handleBlur("fechaNacimiento")}
                    className={`w-full bg-crema border rounded-xl px-4 py-3 text-negro text-sm focus:outline-none focus:ring-1 transition-colors ${
                      getError("fechaNacimiento")
                        ? "border-red-500/60 focus:border-red-500/80 focus:ring-red-500/20"
                        : "border-negro/10 focus:border-lila/50 focus:ring-lila/20"
                    }`}
                  />
                </Field>
                <Field label="Género">
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    className="w-full bg-crema border border-negro/10 rounded-xl px-4 py-3 text-negro text-sm focus:outline-none focus:border-lila/50 focus:ring-1 focus:ring-lila/20 transition-colors appearance-none"
                  >
                    <option value="">Sin especificar</option>
                    <option value="hombre">Hombre</option>
                    <option value="mujer">Mujer</option>
                    <option value="otro">Otro</option>
                  </select>
                </Field>
              </div>
            </div>

            <div className="bg-blanco rounded-2xl border border-negro/10 p-5 space-y-4">
              <p className="font-condensed text-xs text-negro/30 tracking-widest uppercase">
                Datos físicos
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Peso" error={getError("pesoKg")}>
                  <NumberInput
                    value={pesoKg}
                    onChange={setPesoKg}
                    onBlur={() => handleBlur("pesoKg")}
                    placeholder="70"
                    suffix="kg"
                    error={getError("pesoKg")}
                  />
                </Field>
                <Field label="Altura" error={getError("alturaCm")}>
                  <NumberInput
                    value={alturaCm}
                    onChange={setAlturaCm}
                    onBlur={() => handleBlur("alturaCm")}
                    placeholder="175"
                    suffix="cm"
                    error={getError("alturaCm")}
                  />
                </Field>
              </div>
            </div>

            <div className="bg-blanco rounded-2xl border border-negro/10 p-5 space-y-4">
              <p className="font-condensed text-xs text-negro/30 tracking-widest uppercase">
                Ubicación
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ciudad">
                  <TextInput value={ciudad} onChange={setCiudad} placeholder="Bilbao" />
                </Field>
                <Field label="País">
                  <TextInput value={pais} onChange={setPais} placeholder="España" />
                </Field>
              </div>
            </div>

            {saveError && (
              <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-xl text-sm text-red-400">
                {saveError}
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-lila text-negro font-condensed font-bold text-lg py-3.5 rounded-xl hover:bg-lila-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
            >
              {saving ? "GUARDANDO..." : saved ? "✓ GUARDADO" : "GUARDAR CAMBIOS"}
            </button>
          </div>
        )}

        {/* ── tab: programas ── */}
        {tab === "programas" && (
          <div className="flex-1 flex flex-col gap-3">
            {planesLoading ? (
              <div className="flex gap-2 justify-center py-12">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-3 h-3 bg-lila rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            ) : planes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                <p className="font-condensed text-xl font-bold text-negro/30 tracking-wide mb-2">
                  SIN PROGRAMAS
                </p>
                <p className="text-negro/20 text-sm">
                  Todavía no tienes ningún programa creado.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="mt-6 px-6 py-3 rounded-xl border border-lila/40 text-lila font-condensed font-bold text-sm tracking-wide hover:bg-lila/10 transition-colors"
                >
                  CREAR PROGRAMA
                </button>
              </div>
            ) : (
              <>
                <p className="font-condensed text-xs text-negro/30 tracking-widest uppercase mb-1">
                  {planes.length} {planes.length === 1 ? "programa" : "programas"}
                </p>
                {planes.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onActivate={() => handleActivate(plan.id)}
                    onDelete={() => handleDelete(plan.id)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
