"use client";

import { useMemo } from "react";
import type { Match } from "@/lib/matches-data";
import {
  findCurrentMatch,
  formatMatchDayLabel,
  groupMatchesByDateSorted,
  splitMatchesByOfficialResult,
} from "@/lib/match-order";
import { hasOfficialResult } from "@/lib/match-lock";
import { getMatchStatus } from "@/lib/match-status";
import { getKickoffUtc } from "@/lib/timezones";
import { MatchCard, type PredictionData } from "@/components/MatchCard";
import { PollaFinishedMatchRow, type ResultMap } from "@/components/PollaFinishedMatchRow";

type Props = {
  matches: Match[];
  results: ResultMap;
  predMap: Map<number, PredictionData & { matchId?: number }>;
  onPredict: (
    matchId: number,
    home: number,
    away: number,
    homeScorers: string[],
    awayScorers: string[],
  ) => Promise<void>;
  showSocial?: boolean;
};

function CurrentMatchBanner({
  match,
  result,
}: {
  match: Match;
  result?: { homeScore: number | null; awayScore: number | null } | null;
}) {
  const status = getMatchStatus(match, result);
  const kickoff = getKickoffUtc(match.date, match.kickoffEst);
  const label =
    status === "live"
      ? "Partido en curso"
      : status === "awaiting_result"
        ? "Esperando marcador oficial"
        : "Próximo partido";

  return (
    <div className="card-pitch border-lime/30 bg-gradient-to-r from-lime/10 to-transparent p-4">
      <p className="text-xs uppercase tracking-wider text-lime">{label}</p>
      <p className="mt-1 font-display text-xl text-cream sm:text-2xl">
        #{match.id} {match.home} vs {match.away}
      </p>
      <p className="mt-1 text-xs text-muted">
        Pitido:{" "}
        {kickoff.toLocaleString("es-CL", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Santiago",
        })}{" "}
        (Chile) ·{" "}
        {kickoff.toLocaleString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/New_York",
        })}{" "}
        ET
      </p>
      <a href={`#partido-${match.id}`} className="btn-ghost mt-3 inline-block text-sm">
        Ir al partido ↓
      </a>
    </div>
  );
}

function MatchDaySections({
  days,
  results,
  predMap,
  onPredict,
  showSocial,
  highlightId,
}: {
  days: ReturnType<typeof groupMatchesByDateSorted>;
  results: ResultMap;
  predMap: Map<number, PredictionData>;
  onPredict: Props["onPredict"];
  showSocial?: boolean;
  highlightId?: number;
}) {
  if (days.length === 0) {
    return (
      <p className="rounded-xl border border-pitch-mid/40 bg-pitch/30 px-4 py-6 text-center text-sm text-muted">
        No hay partidos pendientes por ahora.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {days.map(({ date, matches: dayMatches }) => (
        <section
          key={date}
          className="overflow-hidden rounded-xl border border-pitch-mid/50 bg-pitch-light/40"
        >
          <h3 className="border-b border-pitch-mid/50 bg-pitch-mid/25 px-3 py-2.5 font-display text-sm capitalize leading-tight text-gold sm:px-4">
            {formatMatchDayLabel(date)}
          </h3>
          <div className="space-y-4 p-3 sm:p-4">
            {dayMatches.map((m) => (
              <div
                key={m.id}
                className={m.id === highlightId ? "rounded-xl ring-2 ring-lime/40 ring-offset-2 ring-offset-pitch-light" : ""}
              >
                <MatchCard
                  match={m}
                  showPrediction
                  showSocial={showSocial}
                  prediction={predMap.get(m.id)}
                  result={results[m.id] ?? null}
                  onPredict={onPredict}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function PollaMatchList({ matches, results, predMap, onPredict, showSocial }: Props) {
  const { active, history } = useMemo(
    () => splitMatchesByOfficialResult(matches, results),
    [matches, results],
  );

  const currentMatch = useMemo(
    () => findCurrentMatch(matches, results),
    [matches, results],
  );

  const activeDays = useMemo(() => groupMatchesByDateSorted(active), [active]);

  const historyWithResults = useMemo(
    () =>
      history.filter((m) => {
        const r = results[m.id];
        return hasOfficialResult(r);
      }),
    [history, results],
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        {historyWithResults.length} finalizado{historyWithResults.length === 1 ? "" : "s"} ·{" "}
        {active.length} por jugar
      </p>

      {currentMatch && <CurrentMatchBanner match={currentMatch} result={results[currentMatch.id]} />}

      <MatchDaySections
        days={activeDays}
        results={results}
        predMap={predMap}
        onPredict={onPredict}
        showSocial={showSocial}
        highlightId={currentMatch?.id}
      />

      {historyWithResults.length > 0 && (
        <details className="group overflow-hidden rounded-xl border border-pitch-mid/50 bg-pitch-light/30">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-cream marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-2">
              <span>
                Historial · {historyWithResults.length}{" "}
                {historyWithResults.length === 1 ? "partido finalizado" : "partidos finalizados"}
              </span>
              <span className="text-xs text-muted group-open:hidden">Ver</span>
              <span className="hidden text-xs text-muted group-open:inline">Ocultar</span>
            </span>
          </summary>
          <div className="space-y-2 border-t border-pitch-mid/40 p-3 sm:p-4">
            {historyWithResults.map((m) => {
              const r = results[m.id]!;
              return (
                <PollaFinishedMatchRow
                  key={m.id}
                  match={m}
                  prediction={predMap.get(m.id)}
                  result={{ homeScore: r.homeScore!, awayScore: r.awayScore! }}
                  onPredict={onPredict}
                  showSocial={showSocial}
                />
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
