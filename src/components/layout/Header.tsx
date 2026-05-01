import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200">
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-primary-600 text-lg">
          Campo
        </Link>
        <div className="flex gap-6 text-sm font-medium text-slate-600">
          <Link href="/dashboard" className="hover:text-primary-600 transition-colors">
            Dashboard
          </Link>
          <Link href="/training" className="hover:text-primary-600 transition-colors">
            Entrenamientos
          </Link>
          <Link href="/coach" className="hover:text-primary-600 transition-colors">
            Coach IA
          </Link>
        </div>
      </nav>
    </header>
  );
}
