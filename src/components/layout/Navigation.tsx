"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/training", label: "Entrenamientos" },
  { href: "/coach", label: "Coach IA" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            pathname === href
              ? "bg-primary-50 text-primary-700"
              : "text-slate-600 hover:text-primary-600"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
