"use client";

import { useTraining } from "@/hooks/useTraining";
import WorkoutCard from "./WorkoutCard";

export default function TrainingPlan() {
  const { sessions, loading } = useTraining();

  if (loading) {
    return <p className="text-slate-400 text-sm">Cargando plan...</p>;
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-500 mb-4">
          Todavía no tienes un plan de entrenamiento.
        </p>
        <a
          href="/coach"
          className="text-primary-600 font-medium hover:underline text-sm"
        >
          Pídele uno a tu coach IA →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <WorkoutCard key={session.id} session={session} />
      ))}
    </div>
  );
}
