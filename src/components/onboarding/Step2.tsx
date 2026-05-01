"use client";

import type { OnboardingData } from "@/types/plan";

const VOLUMEN_OPTS: { value: OnboardingData["volumenCarrera"]; label: string }[] = [
  { value: "nada", label: "No corro" },
  { value: "menos_20", label: "Menos de 20 min" },
  { value: "20_40", label: "20 – 40 min" },
  { value: "mas_40", label: "Más de 40 min" },
];

interface Props {
  data: Partial<OnboardingData>;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2({ data, onChange, onNext, onBack }: Props) {
  const isValid = data.volumenCarrera && data.edad && data.peso;

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-condensed text-lg font-semibold text-campo-lime mb-3 tracking-wide uppercase">
          ¿Cuánto corres ahora mismo?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {VOLUMEN_OPTS.map((o) => (
            <button
              key={o.value}
              onClick={() => onChange({ ...data, volumenCarrera: o.value })}
              className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                data.volumenCarrera === o.value
                  ? "border-campo-lime bg-campo-lime/10 text-campo-lime"
                  : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-condensed text-lg font-semibold text-campo-lime mb-3 tracking-wide uppercase">
          Lesiones o limitaciones físicas
        </label>
        <input
          type="text"
          value={data.lesiones ?? ""}
          onChange={(e) => onChange({ ...data, lesiones: e.target.value })}
          placeholder="Rodilla, espalda, ninguna... (opcional)"
          className="w-full bg-campo-card border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-campo-lime/60 focus:ring-1 focus:ring-campo-lime/30 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-condensed text-lg font-semibold text-campo-lime mb-3 tracking-wide uppercase">
            Edad
          </label>
          <div className="relative">
            <input
              type="number"
              min={10}
              max={99}
              value={data.edad ?? ""}
              onChange={(e) => onChange({ ...data, edad: Number(e.target.value) })}
              placeholder="28"
              className="w-full bg-campo-card border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-campo-lime/60 focus:ring-1 focus:ring-campo-lime/30 transition-colors pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">años</span>
          </div>
        </div>
        <div>
          <label className="block font-condensed text-lg font-semibold text-campo-lime mb-3 tracking-wide uppercase">
            Peso
          </label>
          <div className="relative">
            <input
              type="number"
              min={30}
              max={250}
              value={data.peso ?? ""}
              onChange={(e) => onChange({ ...data, peso: Number(e.target.value) })}
              placeholder="70"
              className="w-full bg-campo-card border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-campo-lime/60 focus:ring-1 focus:ring-campo-lime/30 transition-colors pr-10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">kg</span>
          </div>
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
          SIGUIENTE
        </button>
      </div>
    </div>
  );
}
