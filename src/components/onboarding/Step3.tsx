"use client";

import type { OnboardingData } from "@/types/plan";

const DIAS = [1, 2, 3, 4, 5, 6, 7];

const DURACIONES: { value: OnboardingData["duracionMaxSesion"]; label: string }[] = [
  { value: "30min", label: "30 min" },
  { value: "45min", label: "45 min" },
  { value: "1h", label: "1 hora" },
  { value: "mas_1h", label: "+ de 1h" },
];

const LUGARES: { value: OnboardingData["lugarEntrenamiento"]; label: string; icon: string }[] = [
  { value: "calle", label: "Calle", icon: "🏙️" },
  { value: "pista", label: "Pista", icon: "🏟️" },
  { value: "cinta", label: "Cinta", icon: "🏃" },
  { value: "campo", label: "Campo", icon: "🌿" },
];

interface Props {
  data: Partial<OnboardingData>;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3({ data, onChange, onNext, onBack }: Props) {
  const isValid = data.diasDisponibles && data.duracionMaxSesion && data.lugarEntrenamiento;

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-condensed text-lg font-semibold text-negro tracking-wide uppercase mb-3">
          Días disponibles por semana
        </label>
        <div className="flex gap-2">
          {DIAS.map((d) => (
            <button
              key={d}
              onClick={() => onChange({ ...data, diasDisponibles: d })}
              className={`flex-1 py-3 rounded-xl border font-condensed font-bold text-base transition-all ${
                data.diasDisponibles === d
                  ? "border-negro bg-negro text-blanco"
                  : "border-negro/15 bg-blanco text-negro/50 hover:border-negro/30 hover:text-negro"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-condensed text-lg font-semibold text-negro tracking-wide uppercase mb-3">
          Duración máxima por sesión
        </label>
        <div className="grid grid-cols-4 gap-2">
          {DURACIONES.map((d) => (
            <button
              key={d.value}
              onClick={() => onChange({ ...data, duracionMaxSesion: d.value })}
              className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                data.duracionMaxSesion === d.value
                  ? "border-lila bg-lila-light text-lila"
                  : "border-negro/15 bg-blanco text-negro/60 hover:border-negro/30 hover:text-negro"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-condensed text-lg font-semibold text-negro tracking-wide uppercase mb-3">
          ¿Dónde entrenas?
        </label>
        <div className="grid grid-cols-4 gap-2">
          {LUGARES.map((l) => (
            <button
              key={l.value}
              onClick={() => onChange({ ...data, lugarEntrenamiento: l.value })}
              className={`py-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                data.lugarEntrenamiento === l.value
                  ? "border-lila bg-lila-light"
                  : "border-negro/15 bg-blanco hover:border-negro/30"
              }`}
            >
              <span className="text-xl">{l.icon}</span>
              <span className={`text-xs font-medium ${data.lugarEntrenamiento === l.value ? "text-lila" : "text-negro/60"}`}>
                {l.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-condensed text-lg font-semibold text-negro tracking-wide uppercase mb-3">
          ¿Tienes pulsómetro o Apple Watch?
        </label>
        <div className="flex gap-3">
          {[{ value: true, label: "Sí" }, { value: false, label: "No" }].map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => onChange({ ...data, tieneDispositivo: opt.value })}
              className={`flex-1 py-3 rounded-xl border font-condensed font-bold text-lg transition-all tracking-wide ${
                data.tieneDispositivo === opt.value
                  ? "border-negro bg-negro text-blanco"
                  : "border-negro/15 bg-blanco text-negro/50 hover:border-negro/30 hover:text-negro"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-negro/20 text-negro/60 font-condensed font-bold text-lg py-3.5 rounded-xl hover:border-negro/40 hover:text-negro transition-colors tracking-wide"
        >
          ATRÁS
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex-[2] bg-negro text-blanco font-condensed font-bold text-lg py-3.5 rounded-xl hover:bg-negro/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed tracking-wide"
        >
          SIGUIENTE
        </button>
      </div>
    </div>
  );
}
