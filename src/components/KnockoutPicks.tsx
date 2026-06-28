"use client";

import { useState } from "react";
import { KnockoutBracket } from "@/components/KnockoutBracket";

type ResultMap = Record<
  number,
  { homeScore: number | null; awayScore: number | null; winnerLabel?: string | null }
>;

type Props = {
  initial: Record<number, string>;
  results?: ResultMap;
};

export function KnockoutPicks({ initial, results = {} }: Props) {
  const [picks, setPicks] = useState<Record<number, string>>(initial);
  const [status, setStatus] = useState("");

  async function save(matchId: number, winnerLabel: string) {
    setPicks((p) => ({ ...p, [matchId]: winnerLabel }));
    const res = await fetch("/api/polla/knockout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, winnerLabel }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error ?? "Error al guardar");
      return;
    }
    setStatus(`Guardado #${matchId}`);
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg text-gold sm:text-xl">Cuadro eliminatorio</h3>
        <p className="mt-1 text-xs text-muted sm:text-sm">
          Elige quién pasa en cada cruce (+2 pts). Dieciseisavos en curso — octavos en adelante se
          van definiendo con los ganadores.
        </p>
      </div>
      {status && <p className="text-xs text-lime">{status}</p>}
      <KnockoutBracket
        picks={picks}
        results={results}
        onPick={save}
        interactive
      />
    </div>
  );
}
