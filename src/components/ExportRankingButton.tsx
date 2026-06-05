"use client";

import { useRef, useState } from "react";

type Props = { targetId: string };

export function ExportRankingButton({ targetId }: Props) {
  const [loading, setLoading] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  async function exportImage() {
    setLoading(true);
    try {
      const el = document.getElementById(targetId);
      if (!el) return;
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(el, { backgroundColor: "#0c1f17", pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `we26-ranking-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
    } catch {
      alert("No se pudo exportar la imagen en este navegador.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <a ref={linkRef} className="hidden" />
      <button type="button" onClick={exportImage} disabled={loading} className="btn-ghost text-xs">
        {loading ? "Generando…" : "Exportar tabla PNG"}
      </button>
    </>
  );
}
