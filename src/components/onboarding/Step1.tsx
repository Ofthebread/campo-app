"use client";

import type { OnboardingData } from "@/types/plan";

interface Props {
  data: Partial<OnboardingData>;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export default function Step1({ data, onChange, onNext }: Props) {
  const isValid = (data.objetivo ?? "").trim().length >= 10;

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-condensed text-lg font-semibold text-campo-lime mb-3 tracking-wide uppercase">
          Tu objetivo
        </label>
        <textarea
          value={data.objetivo ?? ""}
          onChange={(e) => onChange({ ...data, objetivo: e.target.value })}
          rows={5}
          placeholder="Cuéntanos tu objetivo. Cuanto más nos cuentes, más personalizado será tu plan."
          className="w-full bg-campo-card border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-campo-lime/60 focus:ring-1 focus:ring-campo-lime/30 resize-none transition-colors"
        />
        <p className="mt-2 text-white/30 text-xs">
          {(data.objetivo ?? "").trim().length < 10
            ? `Mínimo 10 caracteres (${(data.objetivo ?? "").trim().length}/10)`
            : `✓ ${(data.objetivo ?? "").trim().length} caracteres`}
        </p>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full bg-campo-lime text-campo-darker font-condensed font-bold text-lg py-3.5 rounded-xl hover:bg-campo-lime-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed tracking-wide"
      >
        SIGUIENTE
      </button>
    </div>
  );
}
