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

function edadError(edad: number | undefined): string | null {
  if (!edad) return null;
  if (edad < 10) return "Mínimo 10 años";
  if (edad > 99) return "Máximo 99 años";
  return null;
}

function pesoError(peso: number | undefined): string | null {
  if (!peso) return null;
  if (peso < 30) return "Mínimo 30 kg";
  if (peso > 250) return "Máximo 250 kg";
  return null;
}

export default function Step2({ data, onChange, onNext, onBack }: Props) {
  const edadErr = edadError(data.edad);
  const pesoErr = pesoError(data.peso);
  const isValid = data.volumenCarrera && data.edad && data.peso && !edadErr && !pesoErr;

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-condensed text-lg font-semibold text-negro tracking-wide uppercase mb-3">
          ¿Cuánto corres ahora mismo?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {VOLUMEN_OPTS.map((o) => (
            <button
              key={o.value}
              onClick={() => onChange({ ...data, volumenCarrera: o.value })}
              className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                data.volumenCarrera === o.value
                  ? "border-lila bg-lila-light text-lila"
                  : "border-negro/15 text-negro/60 bg-blanco hover:border-negro/30 hover:text-negro"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-condensed text-lg font-semibold text-negro tracking-wide uppercase mb-3">
          Lesiones o limitaciones físicas
        </label>
        <input
          type="text"
          value={data.lesiones ?? ""}
          onChange={(e) => onChange({ ...data, lesiones: e.target.value })}
          placeholder="Rodilla, espalda, ninguna... (opcional)"
          className="w-full bg-blanco border border-negro/15 rounded-xl px-4 py-3 text-negro placeholder-negro/30 text-sm focus:outline-none focus:border-lila/60 focus:ring-1 focus:ring-lila/20 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-condensed text-lg font-semibold text-negro tracking-wide uppercase mb-3">
            Edad
          </label>
          <div className="relative">
            <input
              type="number"
              min={10}
              max={99}
              value={data.edad ?? ""}
              onChange={(e) => onChange({ ...data, edad: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="28"
              className={`w-full bg-blanco border rounded-xl px-4 py-3 text-negro placeholder-negro/30 text-sm focus:outline-none focus:ring-1 transition-colors pr-12 ${
                edadErr ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-negro/15 focus:border-lila/60 focus:ring-lila/20"
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-negro/30 text-sm pointer-events-none">años</span>
          </div>
          {edadErr && <p className="mt-1 text-xs text-red-500">{edadErr}</p>}
        </div>
        <div>
          <label className="block font-condensed text-lg font-semibold text-negro tracking-wide uppercase mb-3">
            Peso
          </label>
          <div className="relative">
            <input
              type="number"
              min={30}
              max={250}
              value={data.peso ?? ""}
              onChange={(e) => onChange({ ...data, peso: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="70"
              className={`w-full bg-blanco border rounded-xl px-4 py-3 text-negro placeholder-negro/30 text-sm focus:outline-none focus:ring-1 transition-colors pr-10 ${
                pesoErr ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-negro/15 focus:border-lila/60 focus:ring-lila/20"
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-negro/30 text-sm pointer-events-none">kg</span>
          </div>
          {pesoErr && <p className="mt-1 text-xs text-red-500">{pesoErr}</p>}
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
