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
        <label className="block font-condensed text-lg font-semibold text-negro tracking-wide uppercase mb-3">
          Tu objetivo
        </label>
        <textarea
          value={data.objetivo ?? ""}
          onChange={(e) => onChange({ ...data, objetivo: e.target.value })}
          rows={5}
          placeholder="Cuéntanos tu objetivo. Cuanto más nos cuentes, más personalizado será tu plan."
          className="w-full bg-blanco border border-negro/15 rounded-xl px-4 py-3 text-negro placeholder-negro/30 text-sm focus:outline-none focus:border-lila/60 focus:ring-1 focus:ring-lila/20 resize-none transition-colors"
        />
        <p className="mt-2 text-negro/30 text-xs">
          {(data.objetivo ?? "").trim().length < 10
            ? `Mínimo 10 caracteres (${(data.objetivo ?? "").trim().length}/10)`
            : `✓ ${(data.objetivo ?? "").trim().length} caracteres`}
        </p>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full bg-negro text-blanco font-condensed font-bold text-lg py-3.5 rounded-xl hover:bg-negro/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed tracking-wide"
      >
        SIGUIENTE
      </button>
    </div>
  );
}
