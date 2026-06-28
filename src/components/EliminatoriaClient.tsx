"use client";

import { useEffect, useState } from "react";
import { KnockoutBracket } from "@/components/KnockoutBracket";
import { PageHeader } from "@/components/ui/PageHeader";

type ResultRow = {
  matchId: number;
  homeScore: number | null;
  awayScore: number | null;
  winnerLabel: string | null;
};

export function EliminatoriaClient() {
  const [results, setResults] = useState<
    Record<number, { homeScore: number | null; awayScore: number | null; winnerLabel?: string | null }>
  >({});

  useEffect(() => {
    fetch("/api/matches/results", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { results: ResultRow[] }) => {
        const map: typeof results = {};
        for (const r of data.results) {
          map[r.matchId] = {
            homeScore: r.homeScore,
            awayScore: r.awayScore,
            winnerLabel: r.winnerLabel,
          };
        }
        setResults(map);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mundial 2026"
        title="Cuadro eliminatorio"
        description="Dieciseisavos en curso. Octavos, cuartos y final se van completando con los ganadores."
      />
      <KnockoutBracket picks={{}} results={results} interactive={false} />
    </div>
  );
}
