"use client";

import { useState } from "react";
import type { OnboardingData, PlanEntrenamiento } from "@/types/plan";
import { savePlan, updateProfile } from "@/lib/db";
import Step1 from "./Step1";
import Step2 from "./Step2";

type Step = 1 | 2 | "loading";

const STEP_LABELS = ["Tu perfil", "Tu objetivo", "Tu plan"];

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
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error generando el plan");

      const data = await res.json();
      const planGenerado: PlanEntrenamiento = data.plan;

      const id = await savePlan(planGenerado);

      await updateProfile({
        objetivo: formData.objetivo,
        nivel: formData.nivel,
        dias_semana: formData.diasDisponibles,
      });

      onPlanCreated(planGenerado, id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStep(2);
    }
  }

  const currentStepIndex = step === 1 ? 0 : step === 2 ? 1 : 2;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      {step !== "loading" && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i <= currentStepIndex
                      ? "bg-primary-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {i < currentStepIndex ? "✓" : i + 1}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    i === currentStepIndex ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      i < currentStepIndex ? "bg-primary-600" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}. Inténtalo de nuevo.
        </div>
      )}

      {step === 1 && (
        <Step1 data={formData} onChange={setFormData} onNext={() => setStep(2)} />
      )}

      {step === 2 && (
        <Step2
          data={formData}
          onChange={setFormData}
          onNext={generarPlan}
          onBack={() => setStep(1)}
        />
      )}

      {step === "loading" && (
        <div className="py-16 flex flex-col items-center gap-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <p className="text-slate-600 font-medium">Generando tu plan personalizado...</p>
          <p className="text-slate-400 text-sm">Puede tardar unos segundos</p>
        </div>
      )}
    </div>
  );
}
