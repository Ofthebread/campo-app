"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp, resetPassword } from "@/lib/supabase";
import TermsModal from "./TermsModal";

type Tab = "login" | "register";
type View = "form" | "forgot";

type FieldErrors = Partial<Record<string, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(form: {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  passwordConfirm: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.nombre.trim() || form.nombre.trim().length < 2)
    errors.nombre = "Introduce tu nombre (mínimo 2 caracteres)";
  if (!form.apellidos.trim() || form.apellidos.trim().length < 2)
    errors.apellidos = "Introduce tus apellidos (mínimo 2 caracteres)";
  if (!form.email.trim())
    errors.email = "El email es obligatorio";
  else if (!EMAIL_REGEX.test(form.email))
    errors.email = "Introduce un email válido (ej: nombre@dominio.com)";
  if (!form.password)
    errors.password = "La contraseña es obligatoria";
  else if (form.password.length < 8)
    errors.password = "La contraseña debe tener al menos 8 caracteres";
  else if (!/[0-9]/.test(form.password))
    errors.password = "La contraseña debe incluir al menos un número";
  else if (!/[^a-zA-Z0-9]/.test(form.password))
    errors.password = "La contraseña debe incluir al menos un símbolo (ej: !, @, #, $)";
  if (!form.passwordConfirm)
    errors.passwordConfirm = "Repite la contraseña";
  else if (form.password !== form.passwordConfirm)
    errors.passwordConfirm = "Las contraseñas no coinciden";
  return errors;
}

function validateLogin(form: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.email.trim())
    errors.email = "El email es obligatorio";
  else if (!EMAIL_REGEX.test(form.email))
    errors.email = "Introduce un email válido (ej: nombre@dominio.com)";
  if (!form.password)
    errors.password = "La contraseña es obligatoria";
  return errors;
}

function inputClass(error?: string) {
  return `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
    error
      ? "border-red-400 focus:ring-red-300 bg-red-50"
      : "border-slate-200 focus:ring-primary-400"
  }`;
}

export default function AuthForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [view, setView] = useState<View>("form");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailError, setForgotEmailError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  function setField(field: string, value: string) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    setServerError(null);
    if (touched[field]) {
      const errors = tab === "register" ? validateRegister(updated) : validateLogin(updated);
      setFieldErrors((prev) => ({ ...prev, [field]: errors[field] }));
    }
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errors = tab === "register" ? validateRegister(form) : validateLogin(form);
    setFieldErrors((prev) => ({ ...prev, [field]: errors[field] }));
  }

  function switchTab(t: Tab) {
    setTab(t);
    setServerError(null);
    setSuccess(null);
    setFieldErrors({});
    setTouched({});
    setView("form");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateLogin(form);
    setFieldErrors(errors);
    setTouched({ email: true, password: true });
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setServerError(null);
    try {
      await signIn(form.email, form.password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? traducirError(err.message) : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateRegister(form);
    setFieldErrors(errors);
    setTouched({ nombre: true, apellidos: true, email: true, password: true, passwordConfirm: true });
    if (!termsAccepted) { setTermsError(true); return; }
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setServerError(null);
    try {
      await signUp(form.email, form.password, form.nombre, form.apellidos);
      setSuccess("Cuenta creada. Revisa tu email para confirmarla y luego inicia sesión.");
    } catch (err) {
      setServerError(err instanceof Error ? traducirError(err.message) : "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_REGEX.test(forgotEmail)) {
      setForgotEmailError("Introduce un email válido");
      return;
    }
    setLoading(true);
    setForgotEmailError(null);
    try {
      await resetPassword(forgotEmail);
      setSuccess("Te hemos enviado un email para restablecer tu contraseña.");
      setView("form");
    } catch {
      setForgotEmailError("No se pudo enviar el email. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (view === "forgot") {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-sm mx-auto">
        <button
          onClick={() => { setView("form"); setForgotEmailError(null); setForgotEmail(""); }}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mb-5 transition-colors"
        >
          <span>←</span> Volver
        </button>
        <h2 className="text-base font-semibold text-slate-800 mb-1">¿Olvidaste tu contraseña?</h2>
        <p className="text-sm text-slate-500 mb-5">
          Introduce tu email y te enviaremos un enlace para restablecerla.
        </p>
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {success}
          </div>
        )}
        <form onSubmit={handleForgot} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => { setForgotEmail(e.target.value); setForgotEmailError(null); }}
              className={inputClass(forgotEmailError ?? undefined)}
              placeholder="tu@email.com"
            />
            {forgotEmailError && <p className="mt-1 text-xs text-red-600">{forgotEmailError}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
    <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-sm mx-auto">
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6">
        <button
          onClick={() => switchTab("login")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Entrar
        </button>
        <button
          onClick={() => switchTab("register")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {serverError}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      {tab === "login" && (
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <Field label="Email" error={fieldErrors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              className={inputClass(fieldErrors.email)}
              placeholder="tu@email.com"
            />
          </Field>
          <Field label="Contraseña" error={fieldErrors.password}>
            <PasswordInput
              value={form.password}
              onChange={(v) => setField("password", v)}
              onBlur={() => handleBlur("password")}
              error={fieldErrors.password}
              placeholder="••••••••"
            />
          </Field>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => { setView("forgot"); setSuccess(null); setServerError(null); }}
              className="text-xs text-primary-600 hover:text-primary-700 transition-colors"
            >
              He olvidado mi contraseña
            </button>
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
        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" error={fieldErrors.nombre}>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setField("nombre", e.target.value)}
                onBlur={() => handleBlur("nombre")}
                className={inputClass(fieldErrors.nombre)}
                placeholder="Ana"
              />
            </Field>
            <Field label="Apellidos" error={fieldErrors.apellidos}>
              <input
                type="text"
                value={form.apellidos}
                onChange={(e) => setField("apellidos", e.target.value)}
                onBlur={() => handleBlur("apellidos")}
                className={inputClass(fieldErrors.apellidos)}
                placeholder="García"
              />
            </Field>
          </div>
          <Field label="Email" error={fieldErrors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              className={inputClass(fieldErrors.email)}
              placeholder="tu@email.com"
            />
          </Field>
          <Field label="Contraseña" error={fieldErrors.password}>
            <PasswordInput
              value={form.password}
              onChange={(v) => setField("password", v)}
              onBlur={() => handleBlur("password")}
              error={fieldErrors.password}
              placeholder="Mínimo 8 caracteres"
            />
            {form.password && <PasswordStrength password={form.password} />}
          </Field>
          <Field label="Repetir contraseña" error={fieldErrors.passwordConfirm}>
            <PasswordInput
              value={form.passwordConfirm}
              onChange={(v) => setField("passwordConfirm", v)}
              onBlur={() => handleBlur("passwordConfirm")}
              error={fieldErrors.passwordConfirm}
              placeholder="••••••••"
            />
          </Field>
          {/* Terms checkbox */}
          <div className="space-y-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  if (e.target.checked) setTermsError(false);
                }}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-400 flex-shrink-0"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                He leído y acepto los{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-primary-600 underline hover:text-primary-700 transition-colors"
                >
                  Términos de Uso
                </button>
                {" "}y la{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-primary-600 underline hover:text-primary-700 transition-colors"
                >
                  Política de Privacidad
                </button>
                , incluyendo el envío de mis datos de salud a Groq para generar el plan de entrenamiento.
              </span>
            </label>
            {termsError && (
              <p className="text-xs text-red-600">
                Debes aceptar los términos y la política de privacidad para continuar.
              </p>
            )}
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

    {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </>
  );
}

function PasswordInput({
  value,
  onChange,
  onBlur,
  error,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 transition-colors ${
          error
            ? "border-red-400 focus:ring-red-300 bg-red-50"
            : "border-slate-200 focus:ring-primary-400"
        }`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        tabIndex={-1}
      >
        {visible ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}

function Eye() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

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
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8 caracteres", ok: password.length >= 8 },
    { label: "un número", ok: /[0-9]/.test(password) },
    { label: "un símbolo", ok: /[^a-zA-Z0-9]/.test(password) },
  ];
  return (
    <div className="flex gap-3 mt-2">
      {checks.map(({ label, ok }) => (
        <span key={label} className={`flex items-center gap-1 text-xs ${ok ? "text-green-600" : "text-slate-400"}`}>
          <span>{ok ? "✓" : "·"}</span>
          {label}
        </span>
      ))}
    </div>
  );
}

function traducirError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Email o contraseña incorrectos";
  if (msg.includes("Email not confirmed")) return "Confirma tu email antes de entrar. Revisa tu bandeja de entrada.";
  if (msg.includes("User already registered")) return "Ya existe una cuenta con este email";
  if (msg.includes("Password should be")) return "La contraseña debe tener al menos 8 caracteres";
  if (msg.includes("over_email_send_rate_limit") || msg.includes("rate limit") || msg.includes("too many requests"))
    return "Demasiados intentos seguidos. Espera unos minutos e inténtalo de nuevo.";
  if (msg.includes("signup_disabled")) return "El registro está temporalmente desactivado.";
  if (msg.includes("Email link is invalid or has expired")) return "El enlace ha caducado. Solicita uno nuevo.";
  if (msg.includes("Token has expired")) return "La sesión ha caducado. Vuelve a iniciar sesión.";
  if (msg.includes("network") || msg.includes("fetch")) return "Error de conexión. Comprueba tu internet e inténtalo de nuevo.";
  return "Ha ocurrido un error. Inténtalo de nuevo.";
}
