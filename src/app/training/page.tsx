import WorkoutCard from "@/components/training/WorkoutCard";
import Header from "@/components/layout/Header";
import { WorkoutSession } from "@/types/training";

const mockSessions: WorkoutSession[] = [
  {
    id: "1",
    date: new Date().toISOString(),
    type: "easy",
    distanceKm: 8,
    durationMin: 48,
    paceMinKm: 6,
    notes: "Ritmo cómodo, zona 2",
    completed: false,
  },
];

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          Historial de Entrenamientos
        </h1>
        <div className="space-y-4">
          {mockSessions.map((session) => (
            <WorkoutCard key={session.id} session={session} />
          ))}
        </div>
      </main>
    </div>
  );
}
