import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: "bg-primary-600 text-white hover:bg-primary-700",
  outline: "border border-primary-600 text-primary-600 hover:bg-primary-50",
  ghost: "text-slate-600 hover:text-primary-600 hover:bg-slate-100",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: Props) {
  return (
    <button
      className={`rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
