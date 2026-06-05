import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import { ClientProviders } from "@/components/ClientProviders";
import { OnboardingWrapper } from "@/components/OnboardingWrapper";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNavShell } from "@/components/SiteNavShell";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "WE26 · Calendario & Polla Mundial",
  description:
    "Calendario completo del Mundial 2026 con horarios en Chile, España y Bélgica, transmisión TV y polla entre amigos.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "WE26",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${bebas.variable} ${dmSans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <SiteNavShell />
        <main className="mx-auto w-full max-w-6xl flex-1 px-3 pb-24 pt-6 sm:px-4 sm:pb-20 sm:pt-8 md:px-8">
          {children}
        </main>
        <SiteFooter />
        <OnboardingWrapper />
        <ClientProviders />
      </body>
    </html>
  );
}
