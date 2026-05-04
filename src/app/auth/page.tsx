import Image from "next/image";
import AuthForm from "@/components/auth/AuthForm";

const HERO_IMG = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80";

export default function AuthPage() {
  return (
    <main className="min-h-screen relative flex flex-col overflow-hidden bg-negro">
      {/* Background athlete image */}
      <div className="absolute inset-0">
        <Image
          src={HERO_IMG}
          alt="Atleta corriendo"
          fill
          className="object-cover object-top"
          priority
          quality={90}
        />
        {/* Gradient: dark at bottom, semi-transparent at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-negro via-negro/70 to-negro/30" />
      </div>

      {/* Logo — top left */}
      <div className="relative z-10 px-7 pt-8 flex items-center gap-2">
        <div className="w-7 h-7 bg-lila rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <span className="font-condensed font-bold text-white text-lg tracking-widest">CAMPO APP</span>
      </div>

      {/* Content: tagline + form */}
      <div className="relative z-10 flex flex-col flex-1 justify-end pb-8 px-5 gap-6 max-w-sm mx-auto w-full">
        {/* Tagline */}
        <div>
          <h1 className="font-condensed font-bold text-white leading-[0.9] mb-3" style={{ fontSize: "clamp(3rem, 12vw, 4.5rem)" }}>
            ENTRENA<br />MÁS.<br />CORRE<br />MEJOR.
          </h1>
          <p className="text-white/50 text-sm tracking-wide">Tu coach de running con IA</p>
        </div>

        {/* Auth form */}
        <AuthForm />
      </div>
    </main>
  );
}
