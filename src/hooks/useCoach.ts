"use client";

import { useState } from "react";
import type { CoachMessage } from "@/types/user";

export function useCoach(planContext?: string) {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(text: string) {
    setLoading(true);
    setError(null);

    const userMsg: CoachMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          planContext,
        }),
      });

      if (!res.ok) throw new Error("Error al contactar al coach");

      const data = await res.json();

      const assistantMsg: CoachMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return { messages, loading, error, sendMessage };
}
