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
        <label className="block font-condensed text-lg font-semibold text-negro tracking-wide uppercase mb-3">
          Otros deportes que practicas
        </label>
        <textarea
          value={data.otrosDeportes ?? ""}
          onChange={(e) => onChange({ ...data, otrosDeportes: e.target.value })}
          rows={3}
          placeholder="Fútbol los fines de semana, natación, bicicleta... (opcional)"
          className="w-full bg-blanco border border-negro/15 rounded-xl px-4 py-3 text-negro placeholder-negro/30 text-sm focus:outline-none focus:border-lila/60 focus:ring-1 focus:ring-lila/20 resize-none transition-colors"
        />
      </div>

      <div>
        <label className="block font-condensed text-lg font-semibold text-negro tracking-wide uppercase mb-3">
          Preferencia de entrenamiento
        </label>
        <div className="grid grid-cols-2 gap-3">
          {PREFERENCIAS.map((p) => (
            <button
              key={p.value}
              onClick={() => onChange({ ...data, preferenciaEntrenamiento: p.value })}
              className={`py-5 px-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                data.preferenciaEntrenamiento === p.value
                  ? "border-lila bg-lila-light"
                  : "border-negro/15 bg-blanco hover:border-negro/30"
              }`}
            >
              <span className={`font-condensed font-bold text-base tracking-wide ${
                data.preferenciaEntrenamiento === p.value ? "text-lila" : "text-negro/80"
              }`}>
                {p.label}
              </span>
              <span className="text-xs text-negro/40">{p.desc}</span>
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
          GENERAR MI PLAN
        </button>
      </div>
    </div>
  );
}
