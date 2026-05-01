"use client";

import { useState } from "react";
import type { Sesion } from "@/types/plan";

interface Props {
  sesion: Sesion;
  completada: boolean;
  onToggle: () => void;
}

const TIPO_COLORS: Record<string, string> = {
  default:   "bg-negro/8 text-negro/60",
  carrera:   "bg-lila/15 text-lila-dark",
  fuerza:    "bg-amber-100 text-amber-700",
  hiit:      "bg-red-100 text-red-600",
  movilidad: "bg-crema text-negro/60",
  descanso:  "bg-negro/5 text-negro/40",
};

function tipoColor(tipo: string): string {
  const t = tipo.toLowerCase();
  if (t.includes("carrera") || t.includes("running") || t.includes("rodaje")) return TIPO_COLORS.carrera;
  if (t.includes("fuerza") || t.includes("musculación") || t.includes("tren")) return TIPO_COLORS.fuerza;
  if (t.includes("hiit") || t.includes("interval") || t.includes("series")) return TIPO_COLORS.hiit;
  if (t.includes("movilidad") || t.includes("flexibilidad") || t.includes("estiram")) return TIPO_COLORS.movilidad;
  if (t.includes("descanso") || t.includes("activo")) return TIPO_COLORS.descanso;
  return TIPO_COLORS.default;
}

export default function SessionCard({ sesion, completada, onToggle }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-colors ${
        completada ? "border-lila/30 bg-lila-light" : "border-negro/10 bg-blanco"
      }`}
    >
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={onToggle}
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            completada ? "bg-lila border-lila text-blanco" : "border-negro/25 hover:border-lila"
          }`}
          title={completada ? "Marcar como pendiente" : "Marcar como completada"}
        >
          {completada && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <button onClick={() => setOpen(!open)} className="flex-1 flex items-center gap-3 text-left">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-semibold text-sm ${completada ? "text-lila line-through" : "text-negro"}`}>
                {sesion.dia}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${tipoColor(sesion.tipo)}`}>
                {sesion.tipo}
              </span>
            </div>
            <p className="text-xs text-negro/40 mt-0.5">{sesion.duracion} min</p>
          </div>
          <span className="text-negro/30 text-sm flex-shrink-0">{open ? "−" : "+"}</span>
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-negro/8">
          <div className="pt-3">
            <p className="text-xs font-condensed font-semibold text-negro/40 uppercase tracking-widest mb-1">
              Calentamiento
            </p>
            <p className="text-sm text-negro/70">{sesion.calentamiento}</p>
          </div>

          <div>
            <p className="text-xs font-condensed font-semibold text-negro/40 uppercase tracking-widest mb-2">
              Ejercicios
            </p>
            <div className="space-y-3">
              {sesion.ejercicios.map((ej, i) => (
                <div key={i} className="bg-crema rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm text-negro">{ej.nombre}</p>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {ej.series && ej.repeticiones && (
                        <span className="text-xs bg-blanco border border-negro/10 rounded px-2 py-0.5 text-negro/60 whitespace-nowrap">
                          {ej.series} × {ej.repeticiones}
                        </span>
                      )}
                      {ej.duracion && (
                        <span className="text-xs bg-blanco border border-negro/10 rounded px-2 py-0.5 text-negro/60 whitespace-nowrap">
                          {ej.duracion}
                        </span>
                      )}
                      {ej.descanso && (
                        <span className="text-xs bg-blanco border border-negro/10 rounded px-2 py-0.5 text-negro/40 whitespace-nowrap">
                          Desc: {ej.descanso}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-negro/50 mt-1.5">{ej.descripcion}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-condensed font-semibold text-negro/40 uppercase tracking-widest mb-1">
              Vuelta a la calma
            </p>
            <p className="text-sm text-negro/70">{sesion.vueltaCalma}</p>
          </div>

          {sesion.consejos && (
            <div className="bg-lila-light border border-lila/20 rounded-lg p-3">
              <p className="text-xs font-condensed font-semibold text-lila mb-1 tracking-wide">Consejo del coach</p>
              <p className="text-xs text-negro/70">{sesion.consejos}</p>
            </div>
          )}

          <button
            onClick={onToggle}
            className={`w-full py-2 rounded-lg font-condensed font-bold text-sm transition-colors tracking-wide ${
              completada ? "bg-negro/8 text-negro/60 hover:bg-negro/15" : "bg-negro text-blanco hover:bg-negro/80"
            }`}
          >
            {completada ? "Marcar como pendiente" : "Marcar como completada"}
          </button>
        </div>
      )}
    </div>
  );
}
