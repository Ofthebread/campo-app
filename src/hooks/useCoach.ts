"use client";

import { useState } from "react";
import type { PlanEntrenamiento } from "@/types/plan";
import { getSessionToken } from "@/lib/supabase";

export interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  updatedPlan?: PlanEntrenamiento;
}

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
      const token = await getSessionToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50_000);

      let res: Response;
      try {
        res = await fetch("/api/coach", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            message: text,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
            planContext,
          }),
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? "Error al contactar al coach");
      }

      const data = await res.json();

      const assistantMsg: CoachMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
        updatedPlan: data.updatedPlan ?? undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("El coach tardó demasiado en responder. Inténtalo de nuevo.");
      } else {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  }

  return { messages, loading, error, sendMessage };
}
