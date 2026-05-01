"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-blanco border rounded-xl px-4 py-3 text-negro placeholder-negro/30 text-sm focus:outline-none focus:border-lila/60 focus:ring-1 focus:ring-lila/30 transition-colors pr-12 ${
            error ? "border-red-500/50" : "border-negro/10"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-negro/30 hover:text-negro/60 transition-colors"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8 caracteres mínimo", ok: password.length >= 8 },
    { label: "Un número", ok: /[0-9]/.test(password) },
    { label: "Un símbolo (!, @, #…)", ok: /[^a-zA-Z0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex flex-col gap-1 mt-2">
      {checks.map((c) => (
        <span key={c.label} className={`text-xs flex items-center gap-1.5 ${c.ok ? "text-lila" : "text-negro/30"}`}>
          <span>{c.ok ? "✓" : "○"}</span>
          {c.label}
        </span>
      ))}
    </div>
  );
}

type UIState = "loading" | "ready" | "success" | "error";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [uiState, setUiState] = useState<UIState>("loading");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; passwordConfirm?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase embeds the tokens in the URL hash — the client SDK picks them up automatically
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUiState("ready");
      } else {
        setUiState("error");
      }
    });
  }, []);

  function validate() {
    const e: typeof errors = {};
    if (password.length < 8) e.password = "Mínimo 8 caracteres";
    else if (!/[0-9]/.test(password)) e.password = "Debe incluir al menos un número";
    else if (!/[^a-zA-Z0-9]/.test(password)) e.password = "Debe incluir al menos un símbolo";
    if (!passwordConfirm) e.passwordConfirm = "Repite la contraseña";
    else if (password !== passwordConfirm) e.passwordConfirm = "Las contraseñas no coinciden";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    setGlobalError(null);

    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setGlobalError("No se pudo actualizar la contraseña. El enlace puede haber caducado.");
    } else {
      setUiState("success");
      setTimeout(() => router.push("/"), 2500);
    }
  }

  return (
    <div className="min-h-screen bg-crema flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="font-condensed text-3xl font-bold text-negro tracking-wide mb-1">
            CAMPO APP
          </h1>
          <p className="text-negro/40 text-sm">Tu coach de running con IA</p>
        </div>

        {uiState === "loading" && (
          <div className="flex gap-2 justify-center py-12">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-3 h-3 bg-lila rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}

        {uiState === "error" && (
          <div className="bg-blanco border border-red-500/30 rounded-2xl p-6 text-center">
            <p className="text-red-400 font-condensed text-lg font-bold tracking-wide mb-2">
              ENLACE INVÁLIDO
            </p>
            <p className="text-negro/50 text-sm mb-6">
              El enlace de recuperación ha caducado o ya fue usado. Solicita uno nuevo.
            </p>
            <button
              onClick={() => router.push("/auth")}
              className="w-full bg-lila text-negro font-condensed font-bold text-lg py-3 rounded-xl hover:bg-lila-dark transition-colors tracking-wide"
            >
              VOLVER AL INICIO
            </button>
          </div>
        )}

        {uiState === "ready" && (
          <div className="bg-blanco border border-negro/10 rounded-2xl p-6">
            <h2 className="font-condensed text-xl font-bold text-negro tracking-wide mb-1">
              NUEVA CONTRASEÑA
            </h2>
            <p className="text-negro/40 text-sm mb-6">Elige una contraseña segura para tu cuenta.</p>

            {globalError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-xl text-sm text-red-400">
                {globalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-condensed text-sm font-semibold text-lila mb-2 tracking-wide uppercase">
                  Nueva contraseña
                </label>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  placeholder="Mínimo 8 caracteres"
                  error={errors.password}
                />
                <PasswordStrength password={password} />
              </div>

              <div>
                <label className="block font-condensed text-sm font-semibold text-lila mb-2 tracking-wide uppercase">
                  Repite la contraseña
                </label>
                <PasswordInput
                  value={passwordConfirm}
                  onChange={setPasswordConfirm}
                  placeholder="Repite la contraseña"
                  error={errors.passwordConfirm}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-lila text-negro font-condensed font-bold text-lg py-3.5 rounded-xl hover:bg-lila-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wide mt-2"
              >
                {submitting ? "GUARDANDO..." : "GUARDAR CONTRASEÑA"}
              </button>
            </form>
          </div>
        )}

        {uiState === "success" && (
          <div className="bg-blanco border border-lila/30 rounded-2xl p-6 text-center">
            <div className="text-lila text-4xl mb-3">✓</div>
            <p className="font-condensed text-xl font-bold text-negro tracking-wide mb-2">
              ¡CONTRASEÑA ACTUALIZADA!
            </p>
            <p className="text-negro/50 text-sm">
              Redirigiendo a la app...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
