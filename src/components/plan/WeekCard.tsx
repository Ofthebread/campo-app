import type { Semana } from "@/types/plan";
import SessionCard from "./SessionCard";

interface Props {
  semana: Semana;
  completadas: Set<string>;
  onToggle: (dia: string, tipo: string) => void;
}

export default function WeekCard({ semana, completadas, onToggle }: Props) {
  const completadasCount = semana.sesiones.filter((s) =>
    completadas.has(`${semana.numero}-${s.dia}`)
  ).length;

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <span className="bg-primary-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              Semana {semana.numero}
            </span>
            <h3 className="font-semibold text-slate-800 text-sm">{semana.descripcion}</h3>
          </div>
          <span className="text-xs text-slate-400">
            {completadasCount}/{semana.sesiones.length}
          </span>
        </div>
        <p className="text-xs text-slate-500">{semana.objetivoSemana}</p>
      </div>
      <div className="space-y-2">
        {semana.sesiones.map((sesion, i) => (
          <SessionCard
            key={i}
            sesion={sesion}
            completada={completadas.has(`${semana.numero}-${sesion.dia}`)}
            onToggle={() => onToggle(sesion.dia, sesion.tipo)}
          />
        ))}
      </div>
    </div>
  );
}
