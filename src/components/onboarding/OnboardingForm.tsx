"use client";

import { useState } from "react";
import type { OnboardingData, PlanEntrenamiento } from "@/types/plan";
import { savePlan, updateProfile } from "@/lib/db";
import { getSessionToken } from "@/lib/supabase";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";

type Step = 1 | 2 | 3 | 4 | "loading";

const STEP_LABELS = ["Objetivo", "Tu estado", "Disponibilidad", "Preferencias"];

interface Props {
  onPlanCreated: (plan: PlanEntrenamiento, planId: string) => void;
}

export default function OnboardingForm({ onPlanCreated }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});
  const [error, setError] = useState<string | null>(null);

  async function generarPlan() {
    setStep("loading");
    setError(null);

    try {
      const token = await getSessionToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 65_000);

      let res: Response;
      try {
        res = await fetch("/api/plan", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(formData),
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Error generando el plan");
      }

      const data = await res.json();
      const planGenerado: PlanEntrenamiento = data.plan;

      const id = await savePlan(planGenerado);

      await updateProfile({
        objetivo: formData.objetivo,
        dias_semana: formData.diasDisponibles,
      });

      onPlanCreated(planGenerado, id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStep(4);
    }
  }

  const currentStepIndex = step === "loading" ? 4 : (step as number) - 1;

  return (
    <div className="min-h-screen bg-campo-dark flex flex-col">
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-5 py-8">

        <div className="mb-8">
          <h1 className="font-condensed text-3xl font-bold text-white tracking-wide mb-1">
            CAMPO APP
          </h1>
          <p className="text-white/40 text-sm">Tu coach de running con IA</p>
        </div>

        {step !== "loading" && (
          <div className="mb-8">
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                    s <= currentStepIndex + 1 ? "bg-campo-lime" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <p className="text-white/40 text-xs font-condensed tracking-widest uppercase">
              Paso {step} de 4 · {STEP_LABELS[currentStepIndex]}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-xl text-sm text-red-400">
            {error}. Inténtalo de nuevo.
          </div>
        )}

        {step === 1 && (
          <Step1 data={formData} onChange={setFormData} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <Step2 data={formData} onChange={setFormData} onNext={() => setStep(3)} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <Step3 data={formData} onChange={setFormData} onNext={() => setStep(4)} onBack={() => setStep(2)} />
        )}
        {step === 4 && (
          <Step4 data={formData} onChange={setFormData} onNext={generarPlan} onBack={() => setStep(3)} />
        )}

        {step === "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 py-20">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-3 h-3 bg-campo-lime rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <div className="text-center">
              <p className="font-condensed text-xl font-bold text-white tracking-wide">
                GENERANDO TU PLAN
              </p>
              <p className="text-white/40 text-sm mt-1">Puede tardar unos segundos</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
