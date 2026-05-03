"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { getActivePlan, getProfile } from "@/lib/db";
import { signOut } from "@/lib/supabase";
import type { PlanEntrenamiento } from "@/types/plan";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import PlanView from "@/components/plan/PlanView";

const HERO_WITH_PLAN = "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1920&q=80";
const HERO_NO_PLAN   = "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=1920&q=80";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [plan, setPlan] = useState<PlanEntrenamiento | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [nombre, setNombre] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    setPlanLoading(true);
    Promise.all([
      getActivePlan(),
      getProfile(),
    ]).then(([result, profile]) => {
      if (result) { setPlan(result.plan); setPlanId(result.id); }
      setNombre(profile?.nombre ?? null);
    }).finally(() => setPlanLoading(false));
  }, [user]);

  async function handleSignOut() {
    await signOut();
    router.push("/auth");
  }

  function handleReset() {
    setPlan(null);
    setPlanId(null);
  }

  const isLoading = loading || planLoading;
  const heroImage = plan ? HERO_WITH_PLAN : HERO_NO_PLAN;

  // ── Greeting text ─────────────────────────────────────────────────────────
  const greeting = nombre
    ? `HOLA,\n${nombre.toUpperCase()}.`
    : "HOLA.";

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-negro">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-3 h-3 bg-lila rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-crema flex flex-col">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div className="relative w-full" style={{ minHeight: plan ? "52vh" : "60vh" }}>
        {/* Athlete image */}
        <Image
          src={heroImage}
          alt="Atleta"
          fill
          className="object-cover object-center"
          priority
          quality={85}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-negro/60 via-negro/40 to-negro/80" />

        {/* Header — transparent over hero */}
        <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-6 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-lila rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="font-condensed font-bold text-white text-base tracking-widest">CAMPO APP</span>
          </div>

          {/* Nav desktop */}
          <nav className="hidden sm:flex items-center gap-5">
            <button onClick={() => router.push("/perfil")}
              className="text-xs text-white/50 hover:text-white transition-colors font-condensed tracking-wide">
              Mi perfil
            </button>
            <button onClick={handleSignOut}
              className="text-xs text-white/50 hover:text-white transition-colors font-condensed tracking-wide">
              Cerrar sesión
            </button>
          </nav>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden text-white/60 hover:text-white transition-colors p-1"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="absolute top-16 right-4 z-20 bg-negro/90 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <button onClick={() => { router.push("/perfil"); setMenuOpen(false); }}
              className="block w-full text-left px-5 py-3.5 text-sm text-white/70 hover:text-white hover:bg-white/5 font-condensed tracking-wide transition-colors">
              Mi perfil
            </button>
            <div className="border-t border-white/8" />
            <button onClick={handleSignOut}
              className="block w-full text-left px-5 py-3.5 text-sm text-white/70 hover:text-white hover:bg-white/5 font-condensed tracking-wide transition-colors">
              Cerrar sesión
            </button>
          </div>
        )}

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-7">
          {plan ? (
            // Has plan — show greeting + plan info
            <>
              <h1 className="font-condensed font-bold text-white leading-[0.88] mb-4 whitespace-pre-line"
                style={{ fontSize: "clamp(2.8rem, 10vw, 4.5rem)" }}>
                {greeting}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-white/50 text-xs font-condensed tracking-widest uppercase mb-1">
                    Plan activo
                  </p>
                  <p className="text-white font-condensed font-bold text-lg leading-tight tracking-wide">
                    {plan.titulo}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {plan.totalSemanas} semanas · Nivel {plan.nivel}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-lila font-condensed font-bold text-3xl leading-none">{plan.totalSemanas}</p>
                  <p className="text-white/30 text-[10px] font-condensed tracking-wider uppercase">semanas</p>
                </div>
              </div>
            </>
          ) : (
            // No plan — motivational
            <>
              <p className="text-lila font-condensed text-xs tracking-widest uppercase mb-3">Tu coach de running con IA</p>
              <h1 className="font-condensed font-bold text-white leading-[0.88]"
                style={{ fontSize: "clamp(3rem, 11vw, 5rem)" }}>
                EMPIEZA.<br />CADA GRAN<br />CORREDOR<br />COMENZÓ<br />AQUÍ.
              </h1>
            </>
          )}
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 bg-crema">
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
      </div>
    </main>
  );
}
