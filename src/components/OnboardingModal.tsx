"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = { done: boolean; hasPolla: boolean };

export function OnboardingModal({ done, hasPolla }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!done && !sessionStorage.getItem("we26-onboarding-dismissed")) {
      setOpen(true);
    }
  }, [done]);

  async function finish() {
    sessionStorage.setItem("we26-onboarding-dismissed", "1");
    await fetch("/api/auth/onboarding", { method: "POST" });
    setOpen(false);
  }

  if (!open) return null;

  const steps = [
    {
      title: "Bienvenido a WE26",
      body: "Calendario del Mundial, hora local automática y polla Balsuos con 8 amigos.",
    },
    {
      title: "Únete a la polla",
      body: hasPolla
        ? "Ya estás en Balsuos. Pronostica antes de cada partido."
        : "Ve a Polla y pulsa «Unirme a Balsuos» con un clic.",
    },
    {
      title: "Puntos y clasificación",
      body: "5 pts marcador exacto, 2 pts L/E/V. Los 4 mejores pasan a la eliminatoria.",
    },
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 sm:items-center">
      <div className="card-pitch w-full max-w-md p-6">
        <p className="text-xs text-muted">
          Paso {step + 1} de {steps.length}
        </p>
        <h2 className="mt-2 font-display text-2xl text-cream">{current.title}</h2>
        <p className="mt-3 text-sm text-muted">{current.body}</p>
        <div className="mt-6 flex gap-2">
          {step < steps.length - 1 ? (
            <button type="button" onClick={() => setStep(step + 1)} className="btn-primary flex-1">
              Siguiente
            </button>
          ) : (
            <button type="button" onClick={finish} className="btn-primary flex-1">
              Empezar
            </button>
          )}
          {!hasPolla && step === 1 && (
            <Link href="/polla/grupos" className="btn-ghost flex-1 text-center">
              Unirme
            </Link>
          )}
        </div>
        <button type="button" onClick={finish} className="mt-3 w-full text-xs text-muted hover:text-cream">
          Saltar tutorial
        </button>
      </div>
    </div>
  );
}
