"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getActivePlan } from "@/lib/db";
import { signOut } from "@/lib/supabase";
import type { PlanEntrenamiento } from "@/types/plan";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import PlanView from "@/components/plan/PlanView";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [plan, setPlan] = useState<PlanEntrenamiento | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    setPlanLoading(true);
    getActivePlan()
      .then((result) => {
        if (result) { setPlan(result.plan); setPlanId(result.id); }
      })
      .finally(() => setPlanLoading(false));
  }, [user]);

  async function handleSignOut() {
    await signOut();
    router.push("/auth");
  }

  function handleReset() {
    setPlan(null);
    setPlanId(null);
  }

  if (loading || planLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-crema">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-3 h-3 bg-lila rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-crema">
      <header className="bg-blanco border-b border-negro/10 px-5 py-3.5 flex items-center justify-between">
        <span className="font-condensed font-bold text-xl text-negro tracking-wide">CAMPO APP</span>
        <div className="flex items-center gap-5">
          <button
            onClick={() => router.push("/perfil")}
            className="text-xs text-negro/50 hover:text-negro transition-colors font-condensed tracking-wide"
          >
            Mi perfil
          </button>
          <button
            onClick={handleSignOut}
            className="text-xs text-negro/50 hover:text-negro transition-colors font-condensed tracking-wide"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {plan ? (
          <PlanView
            plan={plan}
            planId={planId}
            onReset={handleReset}
            onPlanUpdate={(p, id) => { setPlan(p); setPlanId(id); }}
          />
        ) : (
          <OnboardingForm onPlanCreated={(p, id) => { setPlan(p); setPlanId(id); }} />
        )}
      </div>
    </main>
  );
}
