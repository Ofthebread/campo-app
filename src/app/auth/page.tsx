import AuthForm from "@/components/auth/AuthForm";

export default function AuthPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary-600 mb-1">Campo App</h1>
        <p className="text-slate-500 text-sm">Tu coach de entrenamiento con IA</p>
      </div>
      <AuthForm />
    </main>
  );
}
