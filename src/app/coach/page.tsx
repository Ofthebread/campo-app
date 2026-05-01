import ChatInterface from "@/components/coach/ChatInterface";
import Header from "@/components/layout/Header";

export default function CoachPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          Tu Coach IA
        </h1>
        <ChatInterface />
      </main>
    </div>
  );
}
