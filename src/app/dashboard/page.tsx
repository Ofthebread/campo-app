import TrainingPlan from "@/components/training/TrainingPlan";
import Header from "@/components/layout/Header";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          Tu Semana de Entrenamiento
        </h1>
        <TrainingPlan />
      </main>
    </div>
  );
}
