"use client";

import { useState } from "react";
import type { PlanEntrenamiento } from "@/types/plan";
import { useSesionesCompletadas } from "@/hooks/useSesionesCompletadas";
import WeekCard from "./WeekCard";
import ChatInterface from "@/components/coach/ChatInterface";

interface Props {
  plan: PlanEntrenamiento;
  planId: string | null;
  onReset: () => void;
  onPlanUpdate?: (plan: PlanEntrenamiento, planId: string) => void;
}

export default function PlanView({ plan, planId, onReset, onPlanUpdate }: Props) {
  const [semanaActiva, setSemanaActiva] = useState(0);
  const [tab, setTab] = useState<"plan" | "consejos" | "coach">("plan");
  const { completadas, toggle } = useSesionesCompletadas(planId);

  const totalSesiones = plan.semanas.reduce((a, s) => a + s.sesiones.length, 0);
  const porcentaje = totalSesiones > 0 ? Math.round((completadas.size / totalSesiones) * 100) : 0;

  const planContext = JSON.stringify({
    titulo: plan.titulo,
    objetivo: plan.objetivo,
    nivel: plan.nivel,
    totalSemanas: plan.totalSemanas,
    consejosGenerales: plan.consejosGenerales,
    nutricion: plan.nutricion,
    semanas: plan.semanas.map((s) => ({
      numero: s.numero,
      descripcion: s.descripcion,
      objetivoSemana: s.objetivoSemana,
      sesiones: s.sesiones.map((se) => ({
        dia: se.dia,
        tipo: se.tipo,
        duracion: se.duracion,
        ejercicios: se.ejercicios.map((e) => e.nombre),
      })),
    })),
  });

  return (
    <div className="space-y-5">
      {/* plan card */}
      <div className="bg-blanco rounded-2xl border border-negro/10 p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-condensed text-xl font-bold text-negro tracking-wide">{plan.titulo}</h2>
            <p className="text-sm text-negro/50 mt-1">{plan.objetivo}</p>
          </div>
          <button
            onClick={onReset}
            className="text-xs text-negro/40 hover:text-negro transition-colors whitespace-nowrap font-condensed tracking-wide"
          >
            Nuevo plan
          </button>
        </div>

        <div className="flex gap-6 pt-4 border-t border-negro/8 mb-4">
          <div className="text-center">
            <p className="font-condensed text-2xl font-bold text-lila">{plan.totalSemanas}</p>
            <p className="text-xs text-negro/40">semanas</p>
          </div>
          <div className="text-center">
            <p className="font-condensed text-2xl font-bold text-lila">
              {plan.semanas[0]?.sesiones.length ?? 0}
            </p>
            <p className="text-xs text-negro/40">días/semana</p>
          </div>
          <div className="text-center">
            <p className="font-condensed text-2xl font-bold text-lila">{completadas.size}</p>
            <p className="text-xs text-negro/40">completadas</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-negro/40 mb-1">
            <span>Progreso general</span>
            <span>{porcentaje}%</span>
          </div>
          <div className="h-1.5 bg-negro/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-lila rounded-full transition-all duration-500"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="flex gap-1 bg-negro/5 p-1 rounded-xl">
        {(["plan", "consejos", "coach"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg font-condensed font-bold text-sm tracking-wide transition-all ${
              tab === t ? "bg-blanco text-negro shadow-sm" : "text-negro/40 hover:text-negro"
            }`}
          >
            {t === "plan" ? "Plan" : t === "consejos" ? "Consejos" : "Coach IA"}
          </button>
        ))}
      </div>

      {tab === "plan" && (
        <div>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {plan.semanas.map((s, i) => {
              const completadasSemana = s.sesiones.filter((se) =>
                completadas.has(`${s.numero}-${se.dia}`)
              ).length;
              return (
                <button
                  key={i}
                  onClick={() => setSemanaActiva(i)}
                  className={`px-3 py-1.5 rounded-lg font-condensed text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 tracking-wide ${
                    semanaActiva === i
                      ? "bg-negro text-blanco"
                      : "bg-blanco border border-negro/15 text-negro/60 hover:border-negro/30"
                  }`}
                >
                  Sem. {s.numero}
                  {completadasSemana === s.sesiones.length && (
                    <span className="text-[10px]">✓</span>
                  )}
                </button>
              );
            })}
          </div>
          <WeekCard
            semana={plan.semanas[semanaActiva]}
            completadas={completadas}
            onToggle={(dia, tipo) => toggle(plan.semanas[semanaActiva].numero, dia, tipo)}
          />
        </div>
      )}

      {tab === "consejos" && (
        <div className="space-y-4">
          <div className="bg-blanco rounded-2xl border border-negro/10 p-5">
            <h3 className="font-condensed font-bold text-negro tracking-wide mb-3">Consejos generales</h3>
            <ul className="space-y-2">
              {plan.consejosGenerales.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm text-negro/70">
                  <span className="text-lila font-bold mt-0.5">·</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-blanco rounded-2xl border border-negro/10 p-5">
            <h3 className="font-condensed font-bold text-negro tracking-wide mb-3">Nutrición</h3>
            <ul className="space-y-2">
              {plan.nutricion.map((n, i) => (
                <li key={i} className="flex gap-2 text-sm text-negro/70">
                  <span className="text-lila font-bold mt-0.5">·</span>
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "coach" && (
        <div>
          <p className="text-xs text-negro/40 mb-3">
            El coach conoce tu plan completo y puede responder preguntas sobre él.
          </p>
          <ChatInterface planContext={planContext} onPlanUpdate={onPlanUpdate} />
        </div>
      )}
    </div>
  );
}
