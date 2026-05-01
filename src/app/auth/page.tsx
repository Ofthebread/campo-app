import AuthForm from "@/components/auth/AuthForm";

export default function AuthPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-crema px-4">
      <div className="mb-8 text-center">
        <h1 className="font-condensed text-4xl font-bold text-negro tracking-wide mb-1">
          CAMPO APP
        </h1>
        <p className="text-negro/50 text-sm">Tu coach de running con IA</p>
      </div>
      <AuthForm />
    </main>
  );
}
