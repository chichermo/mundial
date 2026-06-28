"use client";

import { useState } from "react";
import { KnockoutBracket } from "@/components/KnockoutBracket";
import type { KnockoutPickData } from "@/lib/knockout-predict";

type ResultMap = Record<
  number,
  { homeScore: number | null; awayScore: number | null; winnerLabel?: string | null }
>;

type Props = {
  initial: Record<number, KnockoutPickData>;
  results?: ResultMap;
};

export function KnockoutPicks({ initial, results = {} }: Props) {
  const [picks, setPicks] = useState<Record<number, KnockoutPickData>>(initial);
  const [status, setStatus] = useState("");

  async function save(matchId: number, home: number, away: number, winnerLabel?: string) {
    const res = await fetch("/api/polla/knockout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore: home, awayScore: away, winnerLabel }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Error al guardar");
    }
    setPicks((p) => ({
      ...p,
      [matchId]: {
        homeScore: home,
        awayScore: away,
        winnerLabel: data.winnerLabel ?? winnerLabel ?? p[matchId]?.winnerLabel,
      },
    }));
    setStatus(`Guardado #${matchId}: ${home}-${away}`);
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg text-gold sm:text-xl">Cuadro eliminatorio</h3>
        <p className="mt-1 text-xs text-muted sm:text-sm">
          Marcador por equipo: <strong className="text-lime">+5</strong> exacto,{" "}
          <strong className="text-gold">+2</strong> L/E/V. Si pronosticas empate, elige quién
          clasifica.
        </p>
      </div>
      {status && <p className="text-xs text-lime">{status}</p>}
      <KnockoutBracket picks={picks} results={results} onPick={save} interactive />
    </div>
  );
}
