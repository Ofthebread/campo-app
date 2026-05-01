"use client";

import { useState, useRef, useEffect } from "react";
import { useCoach } from "@/hooks/useCoach";
import CoachMessage from "./CoachMessage";

export default function ChatInterface({ planContext }: { planContext?: string }) {
  const { messages, loading, error, sendMessage } = useCoach(planContext);
  const [input, setInput] = useState("");
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

  return (
    <div className="flex flex-col bg-white rounded-xl border border-slate-200 h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-slate-400 text-sm text-center pt-8">
            Cuéntame cómo va el entrenamiento o hazme una consulta.
          </p>
        )}
        {messages.map((msg) => (
          <CoachMessage key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="flex gap-1 pl-2">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        )}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-200 p-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu consulta..."
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
