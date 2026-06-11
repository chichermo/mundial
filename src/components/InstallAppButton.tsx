"use client";

import { useState } from "react";
import { PwaInstallModal } from "@/components/PwaInstallModal";
import { usePwaInstall } from "@/hooks/usePwaInstall";

type Props = {
  /** compact = barra superior; default = botón normal */
  variant?: "compact" | "default";
  className?: string;
};

export function InstallAppButton({ variant = "default", className = "" }: Props) {
  const { canInstall, platform, promptInstall } = usePwaInstall();
  const [modalOpen, setModalOpen] = useState(false);

  if (!canInstall) return null;

  async function handleClick() {
    const result = await promptInstall();
    if (result === "manual") setModalOpen(true);
  }

  const compact = variant === "compact";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={
          compact
            ? `inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-lime/40 bg-lime/10 px-2.5 text-xs font-medium text-lime transition-colors hover:bg-lime/20 sm:px-3 sm:text-sm ${className}`
            : `btn-ghost inline-flex items-center gap-2 text-sm ${className}`
        }
        aria-label="Instalar aplicación WE26"
      >
        <span aria-hidden>{compact ? "📲" : "⬇️"}</span>
        <span>{compact ? "Instalar" : "Instalar app"}</span>
      </button>

      <PwaInstallModal
        open={modalOpen}
        platform={platform}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
