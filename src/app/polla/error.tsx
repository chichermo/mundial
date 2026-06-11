"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function PollaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[polla]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="card mx-auto max-w-md space-y-4 p-6 text-center">
      <p className="font-display text-2xl text-cream">No pudimos cargar la polla</p>
      <p className="text-sm text-muted">
        Hubo un error al cargar tus pronósticos. Suele resolverse recargando.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button type="button" onClick={reset} className="btn-primary">
          Reintentar
        </button>
        <Link href="/polla/grupos" className="btn-ghost">
          Volver al inicio de polla
        </Link>
      </div>
    </div>
  );
}
