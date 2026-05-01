"use client";

import { useState, useEffect, useCallback } from "react";
import { getSesionesCompletadas, toggleSesion } from "@/lib/db";

export function useSesionesCompletadas(planId: string | null) {
  const [completadas, setCompletadas] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!planId) return;
    getSesionesCompletadas(planId).then((keys) => setCompletadas(new Set(keys)));
  }, [planId]);

  const toggle = useCallback(
    async (semana: number, dia: string, tipo: string) => {
      if (!planId) return;
      const key = `${semana}-${dia}`;
      const ahora = completadas.has(key);

      // Optimistic update
      setCompletadas((prev) => {
        const next = new Set(prev);
        ahora ? next.delete(key) : next.add(key);
        return next;
      });

      const resultado = await toggleSesion(planId, semana, dia, tipo);

      // Revierte si falla
      if (resultado !== !ahora) {
        setCompletadas((prev) => {
          const next = new Set(prev);
          ahora ? next.add(key) : next.delete(key);
          return next;
        });
      }
    },
    [planId, completadas]
  );

  return { completadas, toggle };
}
