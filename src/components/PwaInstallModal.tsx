"use client";

import type { PwaPlatform } from "@/hooks/usePwaInstall";

type Props = {
  open: boolean;
  platform: PwaPlatform;
  onClose: () => void;
};

export function PwaInstallModal({ open, platform, onClose }: Props) {
  if (!open) return null;

  const isIos = platform === "ios";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/70 p-3 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-lime/30 bg-pitch-light p-5 shadow-2xl safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="pwa-install-title" className="font-display text-2xl text-cream">
          Instalar WE26
        </p>
        <p className="mt-1 text-sm text-muted">
          Acceso rápido desde tu pantalla de inicio, como una app nativa.
        </p>

        {isIos ? (
          <ol className="mt-4 space-y-3 text-sm text-cream">
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime/15 font-display text-lime">
                1
              </span>
              <span>
                Pulsa el botón <strong>Compartir</strong>{" "}
                <span aria-hidden>(□↑)</span> en la barra de Safari.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime/15 font-display text-lime">
                2
              </span>
              <span>
                Elige <strong>«Añadir a pantalla de inicio»</strong>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime/15 font-display text-lime">
                3
              </span>
              <span>
                Confirma con <strong>«Añadir»</strong> arriba a la derecha.
              </span>
            </li>
          </ol>
        ) : (
          <ol className="mt-4 space-y-3 text-sm text-cream">
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime/15 font-display text-lime">
                1
              </span>
              <span>
                Abre el menú del navegador <strong>(⋮)</strong> o la barra de direcciones.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime/15 font-display text-lime">
                2
              </span>
              <span>
                Busca <strong>«Instalar app»</strong> o{" "}
                <strong>«Añadir a pantalla de inicio»</strong>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime/15 font-display text-lime">
                3
              </span>
              <span>Confirma la instalación.</span>
            </li>
          </ol>
        )}

        <p className="mt-4 text-xs text-muted">
          {isIos
            ? "En iPhone/iPad Safari no aparece un popup automático; hay que usar Compartir."
            : "Si no ves la opción, prueba con Chrome en Android."}
        </p>

        <button type="button" onClick={onClose} className="btn-primary mt-5 w-full">
          Entendido
        </button>
      </div>
    </div>
  );
}
