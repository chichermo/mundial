"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

export function PwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    setDeferred(null);
  }

  if (isStandalone || dismissed || !deferred) return null;

  return (
    <div
      className="fixed z-50 mx-auto max-w-md rounded-2xl border border-lime/30 bg-pitch-light p-4 shadow-2xl inset-x-3 sm:inset-x-4 md:left-auto md:right-6 md:max-w-sm"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <p className="font-display text-lg text-cream">Instalar WE26</p>
      <p className="mt-1 text-xs text-muted">Acceso rápido desde tu móvil, como una app.</p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={install} className="btn-primary flex-1 text-sm">
          Instalar
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="btn-ghost text-sm"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
