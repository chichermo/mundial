"use client";

import { useState } from "react";

type Props = {
  code: string;
};

export function CopyInviteCode({ code }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/polla/grupos`
        : code;
    const text = `Únete a mi polla WE26\nCódigo: ${code}\n${url}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gold/30 bg-gold/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted">Invitar amigos</p>
        <p className="font-mono text-2xl font-bold tracking-[0.15em] text-gold sm:text-3xl sm:tracking-[0.2em]">
          {code}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="btn-primary w-full shrink-0 text-sm sm:w-auto sm:!min-h-11"
      >
        {copied ? "¡Copiado!" : "Copiar invitación"}
      </button>
    </div>
  );
}
