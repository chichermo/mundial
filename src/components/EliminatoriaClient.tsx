"use client";

import { useEffect, useMemo, useState } from "react";
import { BracketTree } from "@/components/bracket/BracketTree";
import { PageHeader } from "@/components/ui/PageHeader";
import type { BracketMatchResult } from "@/lib/knockout-bracket";
import {
  getActiveKnockoutPhase,
  getCompletedKnockoutPhases,
  phaseLabel,
} from "@/lib/knockout-rounds";

type ResultRow = {
  matchId: number;
  homeScore: number | null;
  awayScore: number | null;
  winnerLabel: string | null;
};

export function EliminatoriaClient() {
  const [results, setResults] = useState<Record<number, BracketMatchResult | undefined>>({});

  useEffect(() => {
    fetch("/api/matches/results", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { results: ResultRow[] }) => {
        const map: typeof results = {};
        for (const r of data.results) {
          map[r.matchId] = {
            homeScore: r.homeScore,
            awayScore: r.awayScore,
            winnerLabel: r.winnerLabel ?? undefined,
          };
        }
        setResults(map);
      })
      .catch(() => {});
  }, []);

  const activePhase = useMemo(() => getActiveKnockoutPhase(results), [results]);
  const completedPhases = useMemo(() => getCompletedKnockoutPhases(results), [results]);

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        eyebrow="Mundial 2026"
        title="Cuadro eliminatorio"
        description={`Ronda activa: ${phaseLabel(activePhase)}. Resultados oficiales cargados por el admin.`}
      />

      <BracketTree phase={activePhase} results={results} picks={{}} />

      {completedPhases.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg text-cream">Rondas anteriores</h2>
          {[...completedPhases].reverse().map((phase) => (
            <details
              key={phase}
              className="overflow-hidden rounded-xl border border-pitch-mid/50 bg-pitch/30"
            >
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-cream">
                {phaseLabel(phase)} · archivo
              </summary>
              <div className="border-t border-pitch-mid/40 p-3">
                <BracketTree phase={phase} results={results} picks={{}} archived />
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
