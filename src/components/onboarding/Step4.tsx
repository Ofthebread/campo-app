"use client";

import type { OnboardingData } from "@/types/plan";

const PREFERENCIAS: { value: OnboardingData["preferenciaEntrenamiento"]; label: string; desc: string }[] = [
  { value: "corta_intensa", label: "Cortas e intensas", desc: "Menos tiempo, más intensidad" },
  { value: "larga_suave", label: "Largas y suaves", desc: "Más volumen, ritmo cómodo" },
];

interface Props {
  data: Partial<OnboardingData>;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4({ data, onChange, onNext, onBack }: Props) {
  const isValid = data.preferenciaEntrenamiento;

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-condensed text-lg font-semibold text-campo-lime mb-3 tracking-wide uppercase">
          Otros deportes que practicas
        </label>
        <textarea
          value={data.otrosDeportes ?? ""}
          onChange={(e) => onChange({ ...data, otrosDeportes: e.target.value })}
          rows={3}
          placeholder="Fútbol los fines de semana, natación, bicicleta... (opcional)"
          className="w-full bg-campo-card border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-campo-lime/60 focus:ring-1 focus:ring-campo-lime/30 resize-none transition-colors"
        />
      </div>

      <div>
        <label className="block font-condensed text-lg font-semibold text-campo-lime mb-3 tracking-wide uppercase">
          Preferencia de entrenamiento
        </label>
        <div className="grid grid-cols-2 gap-3">
          {PREFERENCIAS.map((p) => (
            <button
              key={p.value}
              onClick={() => onChange({ ...data, preferenciaEntrenamiento: p.value })}
              className={`py-5 px-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                data.preferenciaEntrenamiento === p.value
                  ? "border-campo-lime bg-campo-lime/10"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <span className={`font-condensed font-bold text-base tracking-wide ${
                data.preferenciaEntrenamiento === p.value ? "text-campo-lime" : "text-white/80"
              }`}>
                {p.label}
              </span>
              <span className="text-xs text-white/40">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-white/20 text-white/60 font-condensed font-bold text-lg py-3.5 rounded-xl hover:border-white/40 hover:text-white transition-colors tracking-wide"
        >
          ATRÁS
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex-[2] bg-campo-lime text-campo-darker font-condensed font-bold text-lg py-3.5 rounded-xl hover:bg-campo-lime-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed tracking-wide"
        >
          GENERAR MI PLAN
        </button>
      </div>
    </div>
  );
}
