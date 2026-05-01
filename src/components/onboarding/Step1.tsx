"use client";

import type { Objetivo, Nivel, OnboardingData } from "@/types/plan";

const OBJETIVOS: { value: Objetivo; label: string; desc: string }[] = [
  { value: "rugby", label: "Rugby", desc: "Potencia, agilidad y resistencia para el campo" },
  { value: "navette", label: "Course Navette", desc: "Mejora tu VO2max y resistencia aeróbica" },
  { value: "carrera_popular", label: "Carrera Popular", desc: "Prepárate para tu próxima carrera" },
  { value: "forma_fisica", label: "Forma Física", desc: "Mejora tu condición y bienestar general" },
];

const NIVELES: { value: Nivel; label: string; desc: string }[] = [
  { value: "sedentario", label: "Empezando", desc: "No practico ejercicio regularmente" },
  { value: "algo_activo", label: "En marcha", desc: "Hago algo de ejercicio ocasionalmente" },
  { value: "activo", label: "En forma", desc: "Entreno regularmente, 3+ veces por semana" },
];

const DIAS = [2, 3, 4, 5, 6];

interface Props {
  data: Partial<OnboardingData>;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export default function Step1({ data, onChange, onNext }: Props) {
  const isValid = data.objetivo && data.nivel && data.diasDisponibles;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          ¿Cuál es tu objetivo?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {OBJETIVOS.map((o) => (
            <button
              key={o.value}
              onClick={() => onChange({ ...data, objetivo: o.value })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.objetivo === o.value
                  ? "border-primary-600 bg-primary-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <p className={`font-semibold text-sm ${data.objetivo === o.value ? "text-primary-700" : "text-slate-800"}`}>
                {o.label}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{o.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          ¿Cuál es tu nivel actual?
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {NIVELES.map((n) => (
            <button
              key={n.value}
              onClick={() => onChange({ ...data, nivel: n.value })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.nivel === n.value
                  ? "border-primary-600 bg-primary-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <p className={`font-semibold text-sm ${data.nivel === n.value ? "text-primary-700" : "text-slate-800"}`}>
                {n.label}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          ¿Cuántos días puedes entrenar por semana?
        </h2>
        <div className="flex gap-2">
          {DIAS.map((d) => (
            <button
              key={d}
              onClick={() => onChange({ ...data, diasDisponibles: d })}
              className={`w-12 h-12 rounded-xl border-2 font-semibold text-sm transition-all ${
                data.diasDisponibles === d
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    </div>
  );
}
