"use client";

import { useState } from "react";
import { matches } from "@/lib/matches-data";
import { getPhaseLabel } from "@/lib/matches-data";

const knockout = matches.filter((m) => m.phase !== "group");

type Props = {
  initial: Record<number, string>;
};

export function KnockoutPicks({ initial }: Props) {
  const [picks, setPicks] = useState<Record<number, string>>(initial);
  const [status, setStatus] = useState("");

  async function save(matchId: number, winnerLabel: string) {
    setPicks((p) => ({ ...p, [matchId]: winnerLabel }));
    await fetch("/api/polla/knockout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, winnerLabel }),
    });
    setStatus(`Guardado #${matchId}`);
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg text-gold sm:text-xl">Fase eliminatoria</h3>
      <p className="text-xs text-muted sm:text-sm">
        Elige quién pasa (+2 pts). En móvil, desplázate por los cruces.
      </p>
      {status && <p className="text-xs text-lime">{status}</p>}
      <div className="space-y-3">
        {knockout.map((m) => (
          <div
            key={m.id}
            className="card-pitch flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <div className="flex items-center gap-2 sm:contents">
              <span className="font-display text-lg text-lime/70">#{m.id}</span>
              <span className="rounded bg-pitch-mid/60 px-2 py-0.5 text-[10px] uppercase text-muted">
                {getPhaseLabel(m.phase)}
              </span>
            </div>
            <p className="min-w-0 flex-1 text-sm leading-snug sm:text-base">
              <span className="text-cream">{m.home}</span>
              <span className="mx-1 text-muted">vs</span>
              <span className="text-cream">{m.away}</span>
            </p>
            <select
              value={picks[m.id] ?? ""}
              onChange={(e) => save(m.id, e.target.value)}
              className="min-h-[44px] w-full rounded-xl border border-pitch-mid bg-pitch px-3 py-2 text-base text-cream sm:min-w-[160px] sm:w-auto sm:text-sm"
            >
              <option value="">— Ganador —</option>
              <option value={m.home}>{m.home}</option>
              <option value={m.away}>{m.away}</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
