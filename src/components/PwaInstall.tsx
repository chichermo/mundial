"use client";

import { useEffect, useState } from "react";
import { PwaInstallModal } from "@/components/PwaInstallModal";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export function PwaInstall() {
  const { canInstall, platform, hasNativePrompt, promptInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("we26_pwa_banner_dismissed") === "1") {
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem("we26_pwa_banner_dismissed", "1");
    } catch {
      /* ignore */
    }
  }

  async function install() {
    const result = await promptInstall();
    if (result === "manual") setModalOpen(true);
    if (result === "installed" || result === "dismissed") dismiss();
  }

  // Popup automático solo en Android/Chrome cuando el navegador lo ofrece
  const showBanner = canInstall && hasNativePrompt && !dismissed;

  return (
    <>
      {showBanner && (
        <div
          className="fixed z-50 mx-auto max-w-md rounded-2xl border border-lime/30 bg-pitch-light p-4 shadow-2xl inset-x-3 sm:inset-x-4 md:left-auto md:right-6 md:max-w-sm"
          style={{ bottom: "max(5.5rem, calc(env(safe-area-inset-bottom) + 4.5rem))" }}
        >
          <p className="font-display text-lg text-cream">Instalar WE26</p>
          <p className="mt-1 text-xs text-muted">Acceso rápido desde tu móvil, como una app.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={install} className="btn-primary flex-1 text-sm">
              Instalar
            </button>
            <button type="button" onClick={dismiss} className="btn-ghost text-sm">
              Ahora no
            </button>
          </div>
        </div>
      )}

      <PwaInstallModal
        open={modalOpen}
        platform={platform}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
