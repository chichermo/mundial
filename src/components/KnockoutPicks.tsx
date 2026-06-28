"use client";

import { useMemo, useState } from "react";
import { BracketTree } from "@/components/bracket/BracketTree";
import type { BracketMatchResult } from "@/lib/knockout-bracket";
import type { KnockoutPickData } from "@/lib/knockout-predict";
import {
  getActiveKnockoutPhase,
  getCompletedKnockoutPhases,
  KNOCKOUT_PHASE_ORDER,
  phaseLabel,
} from "@/lib/knockout-rounds";

type ResultMap = Record<number, BracketMatchResult | undefined>;

type Props = {
  initial: Record<number, KnockoutPickData>;
  results?: ResultMap;
};

export function KnockoutPicks({ initial, results = {} }: Props) {
  const [picks, setPicks] = useState<Record<number, KnockoutPickData>>(initial);
  const [status, setStatus] = useState("");

  const activePhase = useMemo(() => getActiveKnockoutPhase(results), [results]);
  const completedPhases = useMemo(() => getCompletedKnockoutPhases(results), [results]);

  async function save(matchId: number, home: number, away: number, winnerLabel?: string) {
    setStatus("");
    const res = await fetch("/api/polla/knockout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore: home, awayScore: away, winnerLabel }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.error ?? data.hint ?? "Error al guardar";
      setStatus(`Error #${matchId}: ${msg}`);
      throw new Error(msg);
    }
    setPicks((p) => ({
      ...p,
      [matchId]: {
        homeScore: data.homeScore ?? home,
        awayScore: data.awayScore ?? away,
        winnerLabel: data.winnerLabel ?? winnerLabel ?? p[matchId]?.winnerLabel,
      },
    }));
    setStatus(`Guardado #${matchId}: ${home}-${away}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg text-gold sm:text-xl">Cuadro eliminatorio</h3>
        <p className="mt-1 text-xs text-muted sm:text-sm">
          Marcador: <strong className="text-lime">+5</strong> exacto,{" "}
          <strong className="text-gold">+2</strong> L/E/V. Si empatas, elige quién clasifica:{" "}
          <strong className="text-gold">+2</strong> extra (hasta +4 sin marcador exacto). Expande
          cada cruce para horario, TV y pronósticos del grupo.
        </p>
        <p className="mt-1 text-xs text-lime">
          Ronda activa: <strong>{phaseLabel(activePhase)}</strong>
        </p>
      </div>

      {status && (
        <p
          className={`text-xs ${status.startsWith("Error") ? "text-red-300" : "text-lime"}`}
          role="status"
        >
          {status}
        </p>
      )}

      <BracketTree
        phase={activePhase}
        results={results}
        picks={picks}
        interactive
        onSave={save}
        showSocial
      />

      {completedPhases.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-display text-base text-cream">Rondas anteriores</h4>
          {[...completedPhases].reverse().map((phase) => (
            <details
              key={phase}
              className="group overflow-hidden rounded-xl border border-pitch-mid/50 bg-pitch/30"
            >
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-cream marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-2">
                  <span>{phaseLabel(phase)} · resultados oficiales</span>
                  <span className="text-xs text-muted group-open:hidden">Ver</span>
                </span>
              </summary>
              <div className="border-t border-pitch-mid/40 p-3">
                <BracketTree
                  phase={phase}
                  results={results}
                  picks={picks}
                  archived
                  showSocial
                />
              </div>
            </details>
          ))}
        </div>
      )}

      {KNOCKOUT_PHASE_ORDER.indexOf(activePhase) < KNOCKOUT_PHASE_ORDER.length - 1 && (
        <p className="text-xs text-muted">
          Cuando el admin publique todos los resultados de {phaseLabel(activePhase).toLowerCase()},
          se habilitará el cuadro de la siguiente ronda.
        </p>
      )}
    </div>
  );
}
