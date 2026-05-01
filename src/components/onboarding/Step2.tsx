"use client";

import { useState } from "react";
import type { OnboardingData } from "@/types/plan";

interface Props {
  data: Partial<OnboardingData>;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SEMANAS_OPTIONS = [4, 6, 8, 10, 12, 16];

export default function Step2({ data, onChange, onNext, onBack }: Props) {
  const [modo, setModo] = useState<"fecha" | "semanas">("semanas");

  const isValid =
    (modo === "fecha" && data.fechaEvento) ||
    (modo === "semanas" && data.semanasHastaObjetivo);

  function handleModo(m: "fecha" | "semanas") {
    setModo(m);
    onChange({ ...data, fechaEvento: undefined, semanasHastaObjetivo: undefined });
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          ¿Cómo quieres planificar?
        </h2>
        <div className="flex gap-3">
          {(["semanas", "fecha"] as const).map((m) => (
            <button
              key={m}
              onClick={() => handleModo(m)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                modo === m
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
              }`}
            >
              {m === "semanas" ? "Por semanas" : "Por fecha de evento"}
            </button>
          ))}
        </div>
      </div>

      {modo === "semanas" && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            ¿Cuántas semanas quieres entrenar?
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {SEMANAS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onChange({ ...data, semanasHastaObjetivo: s, fechaEvento: undefined })}
                className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                  data.semanasHastaObjetivo === s
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                }`}
              >
                {s} semanas
              </button>
            ))}
          </div>
        </div>
      )}

      {modo === "fecha" && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            ¿Cuándo es tu evento?
          </h2>
          <input
            type="date"
            min={today}
            value={data.fechaEvento ?? ""}
            onChange={(e) =>
              onChange({ ...data, fechaEvento: e.target.value, semanasHastaObjetivo: undefined })
            }
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-primary-500 text-sm"
          />
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:border-slate-300 transition-colors text-sm"
        >
          Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          Generar mi plan
        </button>
      </div>
    </div>
  );
}
