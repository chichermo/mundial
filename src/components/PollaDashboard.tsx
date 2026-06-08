"use client";

import { useCallback, useMemo, useState } from "react";
import { matches } from "@/lib/matches-data";
import type { PredictionData } from "./MatchCard";
import { KnockoutPicks } from "./KnockoutPicks";
import { LiveStandingsTable } from "./LiveStandingsTable";
import { MatchCard } from "./MatchCard";
import { TournamentPicksForm } from "./TournamentPicksForm";

type Prediction = PredictionData & { matchId: number };

type ResultMap = Record<number, { homeScore: number | null; awayScore: number | null }>;

type Progress = {
  group: { done: number; total: number; pct: number };
  knockout: { done: number; total: number; pct: number };
};

type Props = {
  memberId: string;
  predictions: Prediction[];
  knockout: Record<number, string>;
  results: ResultMap;
  tournament: {
    champion?: string | null;
    surprise?: string | null;
    revelationTeam?: string | null;
    topScorer?: string | null;
    revelationPlayer?: string | null;
  };
  progress: Progress;
};

type Tab = "partidos" | "eliminatoria" | "especiales" | "ranking";

export function PollaDashboard({
  memberId,
  predictions,
  knockout,
  results,
  tournament,
  progress,
}: Props) {
  const [tab, setTab] = useState<Tab>("partidos");
  const predMap = useMemo(
    () => new Map(predictions.map((p) => [p.matchId, p])),
    [predictions],
  );

  const onPredict = useCallback(
    async (
      matchId: number,
      home: number,
      away: number,
      homeScorers: string[],
      awayScorers: string[],
    ) => {
      const res = await fetch("/api/polla/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          homeScore: home,
          awayScore: away,
          homeScorers,
          awayScorers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
    },
    [],
  );

  const groupMatches = matches.filter((m) => m.phase === "group");

  const tabs: { id: Tab; label: string; short: string; badge?: string }[] = [
    {
      id: "partidos",
      label: "Fase grupos",
      short: "Grupos",
      badge: `${progress.group.done}/${progress.group.total}`,
    },
    {
      id: "eliminatoria",
      label: "Eliminatoria",
      short: "Elim.",
      badge: `${progress.knockout.done}/${progress.knockout.total}`,
    },
    { id: "especiales", label: "Especiales", short: "Esp." },
    { id: "ranking", label: "Ranking", short: "Rank." },
  ];

  return (
    <div className="space-y-6">
      <nav
        className="tab-bar-sticky -mx-3 flex gap-1 overflow-x-auto rounded-none bg-pitch-light/95 px-3 py-1 backdrop-blur-md sm:mx-0 sm:rounded-xl sm:p-1"
        aria-label="Secciones polla"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors sm:gap-2 sm:px-4 ${
              tab === t.id ? "bg-lime text-ink shadow-sm" : "text-muted hover:text-cream"
            }`}
          >
            <span className="sm:hidden">{t.short}</span>
            <span className="hidden sm:inline">{t.label}</span>
            {t.badge && (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                  tab === t.id ? "bg-ink/20" : "bg-pitch-mid"
                }`}
              >
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {tab === "partidos" && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Pronostica antes del pitido. Marcador: <strong className="text-lime">+5</strong> exacto,{" "}
            <strong className="text-gold">+2</strong> L/E/V. Opcional: indica goleadores por equipo.
            Una vez comenzado el partido o con resultado cargado, queda cerrado.
          </p>
          {groupMatches.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              showPrediction
              showSocial
              prediction={predMap.get(m.id)}
              result={results[m.id] ?? null}
              onPredict={onPredict}
            />
          ))}
        </div>
      )}

      {tab === "eliminatoria" && (
        <KnockoutPicks initial={knockout} results={results} />
      )}

      {tab === "especiales" && <TournamentPicksForm initial={tournament} />}

      {tab === "ranking" && <LiveStandingsTable highlightId={memberId} />}
    </div>
  );
}
