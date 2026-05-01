"use client";

import { useState, useEffect } from "react";
import type { WorkoutSession } from "@/types/training";

export function useTraining() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/training")
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  return { sessions, loading };
}
