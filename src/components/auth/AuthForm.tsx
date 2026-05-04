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
  nombre: string; apellidos: string; email: string; password: string; passwordConfirm: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.nombre.trim() || form.nombre.trim().length < 2) errors.nombre = "Mínimo 2 caracteres";
  if (!form.apellidos.trim() || form.apellidos.trim().length < 2) errors.apellidos = "Mínimo 2 caracteres";
  if (!form.email.trim()) errors.email = "El email es obligatorio";
  else if (!EMAIL_REGEX.test(form.email)) errors.email = "Email inválido";
  if (!form.password) errors.password = "La contraseña es obligatoria";
  else if (form.password.length < 8) errors.password = "Mínimo 8 caracteres";
  else if (!/[0-9]/.test(form.password)) errors.password = "Debe incluir un número";
  else if (!/[^a-zA-Z0-9]/.test(form.password)) errors.password = "Debe incluir un símbolo";
  if (!form.passwordConfirm) errors.passwordConfirm = "Repite la contraseña";
  else if (form.password !== form.passwordConfirm) errors.passwordConfirm = "No coinciden";
  return errors;
}

function validateLogin(form: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.email.trim()) errors.email = "El email es obligatorio";
  else if (!EMAIL_REGEX.test(form.email)) errors.email = "Email inválido";
  if (!form.password) errors.password = "La contraseña es obligatoria";
  return errors;
}

// Input base: semi-transparent dark on dark background
function inputClass(error?: string) {
  return `w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
    error
      ? "bg-red-500/15 border border-red-400/50 focus:ring-red-400/30"
      : "bg-white/8 border border-white/10 focus:ring-white/20 focus:border-white/30"
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
    nombre: "", apellidos: "", email: "", password: "", passwordConfirm: "",
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
    setTab(t); setServerError(null); setSuccess(null);
    setFieldErrors({}); setTouched({}); setView("form");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateLogin(form);
    setFieldErrors(errors);
    setTouched({ email: true, password: true });
    if (Object.keys(errors).length > 0) return;
    setLoading(true); setServerError(null);
    try {
      await signIn(form.email, form.password);
      router.push("/"); router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? traducirError(err.message) : "Error al iniciar sesión");
    } finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateRegister(form);
    setFieldErrors(errors);
    setTouched({ nombre: true, apellidos: true, email: true, password: true, passwordConfirm: true });
    if (!termsAccepted) { setTermsError(true); return; }
    if (Object.keys(errors).length > 0) return;
    setLoading(true); setServerError(null);
    try {
      await signUp(form.email, form.password, form.nombre, form.apellidos);
      setSuccess("Cuenta creada. Revisa tu email para confirmarla.");
    } catch (err) {
      setServerError(err instanceof Error ? traducirError(err.message) : "Error al crear la cuenta");
    } finally { setLoading(false); }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_REGEX.test(forgotEmail)) { setForgotEmailError("Introduce un email válido"); return; }
    setLoading(true); setForgotEmailError(null);
    try {
      await resetPassword(forgotEmail);
      setSuccess("Te hemos enviado el enlace para restablecer la contraseña.");
      setView("form");
    } catch { setForgotEmailError("No se pudo enviar el email. Inténtalo de nuevo."); }
    finally { setLoading(false); }
  }

  // Shared card wrapper — glassmorphism dark
  const card = "bg-white/8 backdrop-blur-md border border-white/12 rounded-3xl p-6 w-full";

  if (view === "forgot") {
    return (
      <div className={card}>
        <button
          onClick={() => { setView("form"); setForgotEmailError(null); setForgotEmail(""); }}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 mb-5 transition-colors"
        >
          ← Volver
        </button>
        <h2 className="font-condensed font-bold text-white text-xl tracking-wide mb-1">¿OLVIDASTE TU<br />CONTRASEÑA?</h2>
        <p className="text-white/40 text-xs mb-5 leading-relaxed">
          Introduce tu email y te enviaremos un enlace para restablecerla.
        </p>
        {success && (
          <div className="mb-4 p-3 bg-lila/20 border border-lila/30 rounded-xl text-sm text-white">
            {success}
          </div>
        )}
        <form onSubmit={handleForgot} className="space-y-4" noValidate>
          <div>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => { setForgotEmail(e.target.value); setForgotEmailError(null); }}
              className={inputClass(forgotEmailError ?? undefined)}
              placeholder="tu@email.com"
            />
            {forgotEmailError && <p className="mt-1.5 text-xs text-red-400">{forgotEmailError}</p>}
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-lila text-negro font-condensed font-bold py-3.5 rounded-xl hover:bg-lila-dark transition-colors disabled:opacity-60 tracking-wide">
            {loading ? "Enviando..." : "ENVIAR ENLACE"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className={card}>
        {/* Tab switcher */}
        <div className="flex gap-1 bg-black/20 p-1 rounded-2xl mb-6">
          {(["login", "register"] as Tab[]).map((t) => (
            <button key={t} onClick={() => switchTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-condensed font-bold tracking-wide transition-all ${
                tab === t ? "bg-white text-negro shadow-md" : "text-white/40 hover:text-white/70"
              }`}>
              {t === "login" ? "ENTRAR" : "REGISTRARSE"}
            </button>
          ))}
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-sm text-red-300">
            {serverError}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-lila/20 border border-lila/30 rounded-xl text-sm text-white">
            {success}
          </div>
        )}

        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-3" noValidate>
            <FieldWrap error={fieldErrors.email}>
              <input type="email" value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={inputClass(fieldErrors.email)}
                placeholder="Email" />
            </FieldWrap>
            <FieldWrap error={fieldErrors.password}>
              <PasswordInput value={form.password}
                onChange={(v) => setField("password", v)}
                onBlur={() => handleBlur("password")}
                error={fieldErrors.password}
                placeholder="Contraseña" />
            </FieldWrap>
            <div className="flex justify-end pt-0.5">
              <button type="button"
                onClick={() => { setView("forgot"); setSuccess(null); setServerError(null); }}
                className="text-xs text-white/35 hover:text-white/60 transition-colors">
                He olvidado mi contraseña
              </button>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-lila text-negro font-condensed font-bold py-3.5 rounded-xl hover:bg-lila-dark transition-colors disabled:opacity-60 tracking-wide mt-2">
              {loading ? "ENTRANDO..." : "ENTRAR"}
            </button>
          </form>
        )}

        {tab === "register" && (
          <form onSubmit={handleRegister} className="space-y-3" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <FieldWrap error={fieldErrors.nombre}>
                <input type="text" value={form.nombre}
                  onChange={(e) => setField("nombre", e.target.value)}
                  onBlur={() => handleBlur("nombre")}
                  className={inputClass(fieldErrors.nombre)}
                  placeholder="Nombre" />
              </FieldWrap>
              <FieldWrap error={fieldErrors.apellidos}>
                <input type="text" value={form.apellidos}
                  onChange={(e) => setField("apellidos", e.target.value)}
                  onBlur={() => handleBlur("apellidos")}
                  className={inputClass(fieldErrors.apellidos)}
                  placeholder="Apellidos" />
              </FieldWrap>
            </div>
            <FieldWrap error={fieldErrors.email}>
              <input type="email" value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={inputClass(fieldErrors.email)}
                placeholder="Email" />
            </FieldWrap>
            <FieldWrap error={fieldErrors.password}>
              <PasswordInput value={form.password}
                onChange={(v) => setField("password", v)}
                onBlur={() => handleBlur("password")}
                error={fieldErrors.password}
                placeholder="Contraseña" />
              {form.password && <PasswordStrength password={form.password} />}
            </FieldWrap>
            <FieldWrap error={fieldErrors.passwordConfirm}>
              <PasswordInput value={form.passwordConfirm}
                onChange={(v) => setField("passwordConfirm", v)}
                onBlur={() => handleBlur("passwordConfirm")}
                error={fieldErrors.passwordConfirm}
                placeholder="Repite la contraseña" />
            </FieldWrap>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input type="checkbox" checked={termsAccepted}
                  onChange={(e) => { setTermsAccepted(e.target.checked); if (e.target.checked) setTermsError(false); }}
                  className="mt-0.5 w-4 h-4 rounded border-white/20 text-lila focus:ring-lila/30 flex-shrink-0 bg-white/10" />
                <span className="text-xs text-white/40 leading-relaxed">
                  He leído y acepto los{" "}
                  <button type="button" onClick={() => setShowTerms(true)}
                    className="text-lila underline hover:text-lila-dark transition-colors">
                    Términos de Uso
                  </button>
                  {" "}y la{" "}
                  <button type="button" onClick={() => setShowTerms(true)}
                    className="text-lila underline hover:text-lila-dark transition-colors">
                    Política de Privacidad
                  </button>
                  , incluyendo el envío de mis datos de salud a Groq.
                </span>
              </label>
              {termsError && <p className="mt-1.5 text-xs text-red-400">Debes aceptar los términos para continuar.</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-lila text-negro font-condensed font-bold py-3.5 rounded-xl hover:bg-lila-dark transition-colors disabled:opacity-60 tracking-wide mt-1">
              {loading ? "CREANDO CUENTA..." : "CREAR CUENTA"}
            </button>
          </form>
        )}
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldWrap({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function PasswordInput({ value, onChange, onBlur, error, placeholder }: {
  value: string; onChange: (v: string) => void; onBlur: () => void; error?: string; placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input type={visible ? "text" : "password"} value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
          error
            ? "bg-red-500/15 border border-red-400/50 focus:ring-red-400/30"
            : "bg-white/8 border border-white/10 focus:ring-white/20 focus:border-white/30"
        }`}
      />
      <button type="button" onClick={() => setVisible((v) => !v)} tabIndex={-1}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
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

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8 caracteres", ok: password.length >= 8 },
    { label: "número", ok: /[0-9]/.test(password) },
    { label: "símbolo", ok: /[^a-zA-Z0-9]/.test(password) },
  ];
  return (
    <div className="flex gap-3 mt-2">
      {checks.map(({ label, ok }) => (
        <span key={label} className={`flex items-center gap-1 text-xs transition-colors ${ok ? "text-lila" : "text-white/25"}`}>
          <span>{ok ? "✓" : "·"}</span> {label}
        </span>
      ))}
    </div>
  );
}

function traducirError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Email o contraseña incorrectos";
  if (msg.includes("Email not confirmed")) return "Confirma tu email antes de entrar.";
  if (msg.includes("User already registered")) return "Ya existe una cuenta con este email";
  if (msg.includes("Password should be")) return "La contraseña debe tener al menos 8 caracteres";
  if (msg.includes("over_email_send_rate_limit") || msg.includes("rate limit")) return "Demasiados intentos. Espera unos minutos.";
  if (msg.includes("signup_disabled")) return "El registro está temporalmente desactivado.";
  if (msg.includes("Email link is invalid or has expired")) return "El enlace ha caducado. Solicita uno nuevo.";
  if (msg.includes("Token has expired")) return "La sesión ha caducado. Vuelve a iniciar sesión.";
  if (msg.includes("network") || msg.includes("fetch")) return "Error de conexión. Comprueba tu internet.";
  return "Ha ocurrido un error. Inténtalo de nuevo.";
}
