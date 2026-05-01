import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: "Campo App — Tu Coach de Running IA",
  description:
    "Entrenamiento de running personalizado con coach de inteligencia artificial. Planes adaptados a tu nivel y objetivos.",
  keywords: ["running", "entrenamiento", "coach", "IA", "plan de entrenamiento"],
  openGraph: {
    title: "Campo App",
    description: "Tu coach de running con IA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${barlowCondensed.variable}`}>{children}</body>
    </html>
  );
}
