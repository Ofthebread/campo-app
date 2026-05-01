import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";

interface Props {
  params: { id: string };
}

export default function TrainingDetailPage({ params }: Props) {
  if (!params.id) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Detalle del Entrenamiento
        </h1>
        <p className="text-slate-500">ID: {params.id}</p>
      </main>
    </div>
  );
}
