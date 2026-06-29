"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { matches } from "@/lib/matches-data";
import type { KnockoutPickData } from "@/lib/knockout-predict";
import { isKnockoutPhase } from "@/lib/tournament-phase";
import { KnockoutPicks } from "./KnockoutPicks";
import { LiveStandingsTable } from "./LiveStandingsTable";
import { PollaMatchList } from "./PollaMatchList";
import { type PredictionData } from "./MatchCard";
import { TournamentPicksForm } from "./TournamentPicksForm";

const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "all"] as const;
type GroupFilter = (typeof GROUP_LETTERS)[number];

type Prediction = PredictionData & { matchId: number };

type ResultMap = Record<number, { homeScore: number | null; awayScore: number | null }>;

type Progress = {
  group: { done: number; total: number; pct: number };
  knockout: { done: number; total: number; pct: number };
};

type Props = {
  memberId: string;
  predictions: Prediction[];
  knockout: Record<number, KnockoutPickData>;
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
type MatchView = "calendar" | "group";

export function PollaDashboard({
  memberId,
  predictions,
  knockout,
  results: initialResults,
  tournament,
  progress,
}: Props) {
  const [tab, setTab] = useState<Tab>(() =>
    isKnockoutPhase() ? "eliminatoria" : "partidos",
  );
  const [matchView, setMatchView] = useState<MatchView>("calendar");
  const [groupFilter, setGroupFilter] = useState<GroupFilter>("A");
  const [results, setResults] = useState<ResultMap>(initialResults);
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

  const refreshResults = useCallback(async () => {
    try {
      const res = await fetch("/api/matches/results", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        results: { matchId: number; homeScore: number | null; awayScore: number | null }[];
      };
      const next: ResultMap = {};
      for (const r of data.results) {
        next[r.matchId] = { homeScore: r.homeScore, awayScore: r.awayScore };
      }
      setResults(next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refreshResults();
    const id = setInterval(refreshResults, 60_000);
    return () => clearInterval(id);
  }, [refreshResults]);

  const allGroupMatches = useMemo(
    () => matches.filter((m) => m.phase === "group"),
    [],
  );

  const displayedMatches = useMemo(() => {
    if (matchView === "group" && groupFilter !== "all") {
      return allGroupMatches.filter((m) => m.group === groupFilter);
    }
    return allGroupMatches;
  }, [allGroupMatches, groupFilter, matchView]);

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
            <strong className="text-gold">+2</strong> L/E/V. Opcional: goleadores por equipo.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setMatchView("calendar")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                matchView === "calendar" ? "bg-lime text-ink" : "bg-pitch-mid/50 text-muted"
              }`}
            >
              Calendario
            </button>
            <button
              type="button"
              onClick={() => setMatchView("group")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                matchView === "group" ? "bg-lime text-ink" : "bg-pitch-mid/50 text-muted"
              }`}
            >
              Por grupo
            </button>
          </div>
          {matchView === "group" && (
            <div className="flex flex-wrap gap-1.5">
              {GROUP_LETTERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroupFilter(g)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    groupFilter === g ? "bg-lime text-ink" : "bg-pitch-mid/50 text-muted"
                  }`}
                >
                  {g === "all" ? "Todos" : `Grupo ${g}`}
                </button>
              ))}
            </div>
          )}
          {matchView === "calendar" ? (
            <PollaMatchList
              matches={displayedMatches}
              results={results}
              predMap={predMap}
              onPredict={onPredict}
              showSocial
            />
          ) : (
            <>
              {groupFilter === "all" && (
                <p className="text-xs text-muted">
                  Elige un grupo (A–H) o usa la vista Calendario para ver todos en orden.
                </p>
              )}
              <PollaMatchList
                matches={displayedMatches}
                results={results}
                predMap={predMap}
                onPredict={onPredict}
                showSocial
              />
            </>
          )}
        </div>
      )}

      {tab === "eliminatoria" && (
        <div className="min-w-0">
          <KnockoutPicks initial={knockout} results={results} />
        </div>
      )}

      {tab === "especiales" && <TournamentPicksForm initial={tournament} />}

      {tab === "ranking" && <LiveStandingsTable highlightId={memberId} />}
    </div>
  );
}
