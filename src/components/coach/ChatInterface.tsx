"use client";

import { useState, useRef, useEffect } from "react";
import { useCoach } from "@/hooks/useCoach";
import type { PlanEntrenamiento } from "@/types/plan";
import { savePlan } from "@/lib/db";

interface Props {
  planContext?: string;
  onPlanUpdate?: (plan: PlanEntrenamiento, planId: string) => void;
}

export default function ChatInterface({ planContext, onPlanUpdate }: Props) {
  const { messages, loading, error, sendMessage } = useCoach(planContext);
  const [input, setInput] = useState("");
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
    setInput("");
  }

  async function handleApplyPlan(msgId: string, plan: PlanEntrenamiento) {
    setApplying(msgId);
    try {
      const id = await savePlan(plan);
      setApplied((prev) => new Set(prev).add(msgId));
      onPlanUpdate?.(plan, id);
    } catch {
      // silent — user can retry
    } finally {
      setApplying(null);
    }
  }

  return (
    <div className="flex flex-col bg-white rounded-xl border border-slate-200 h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-slate-400 text-sm text-center pt-8">
            Cuéntame cómo va el entrenamiento o pídeme que ajuste tu plan.
          </p>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary-600 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>

            {msg.role === "assistant" && msg.updatedPlan && (
              <div className="mt-2 ml-1 bg-primary-50 border border-primary-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="text-primary-600 text-xl flex-shrink-0">📋</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary-800 mb-0.5">
                      Plan actualizado listo
                    </p>
                    <p className="text-xs text-primary-700 mb-3">
                      {msg.updatedPlan.titulo} · {msg.updatedPlan.totalSemanas} semanas
                    </p>
                    {applied.has(msg.id) ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Cambios aplicados
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyPlan(msg.id, msg.updatedPlan!)}
                        disabled={applying === msg.id}
                        className="text-xs font-semibold bg-primary-600 text-white px-4 py-1.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
                      >
                        {applying === msg.id ? "Aplicando..." : "Aplicar cambios"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-1 pl-2">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu consulta o pide cambios en el plan..."
          disabled={loading}
          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
