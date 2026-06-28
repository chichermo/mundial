"use client";

import { useMemo } from "react";
import type { Match } from "@/lib/matches-data";
import {
  buildKnockoutBracket,
  getWinnerName,
  resolveFeederLabel,
  type BracketMatchResult,
} from "@/lib/knockout-bracket";
import { isPredictionLocked, lockReason } from "@/lib/match-lock";
import { formatMatchDayLabel, getMatchCalendarDay } from "@/lib/match-order";
import { formatKickoffInZone } from "@/lib/timezones";

type ResultMap = Record<number, BracketMatchResult | undefined>;

type Props = {
  picks: Record<number, string>;
  results?: ResultMap;
  onPick?: (matchId: number, winnerLabel: string) => void;
  interactive?: boolean;
};

function BracketMatchCard({
  match,
  result,
  pick,
  feedsFrom,
  results,
  onPick,
  interactive,
}: {
  match: Match;
  result?: BracketMatchResult;
  pick?: string;
  feedsFrom?: [number, number];
  results: ResultMap;
  onPick?: (matchId: number, winnerLabel: string) => void;
  interactive?: boolean;
}) {
  const locked = isPredictionLocked(match, result);
  const reason = lockReason(match, result);
  const winner = getWinnerName(match, result);
  const { time, dateLabel } = formatKickoffInZone(
    match.date,
    match.kickoffEst,
    "America/Santiago",
  );

  return (
    <div
      id={`partido-${match.id}`}
      className={`rounded-xl border p-3 ${
        winner
          ? "border-lime/40 bg-lime/5"
          : locked
            ? "border-pitch-mid/50 bg-pitch/40"
            : "border-pitch-mid/50 bg-pitch-light/30"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-display text-sm text-lime">#{match.id}</span>
        {feedsFrom && (
          <span className="text-[10px] text-muted">
            {resolveFeederLabel(feedsFrom[0], results)} · {resolveFeederLabel(feedsFrom[1], results)}
          </span>
        )}
      </div>

      <div className="space-y-1 text-sm">
        <p className={winner === match.home ? "font-semibold text-lime" : "text-cream"}>
          {match.home}
          {result?.homeScore != null && (
            <span className="ml-2 font-display text-gold">{result.homeScore}</span>
          )}
        </p>
        <p className={winner === match.away ? "font-semibold text-lime" : "text-cream"}>
          {match.away}
          {result?.awayScore != null && (
            <span className="ml-2 font-display text-gold">{result.awayScore}</span>
          )}
        </p>
      </div>

      <p className="mt-2 text-[10px] text-muted">
        {dateLabel} · {time} Chile · {match.city}
      </p>

      {interactive && onPick && (
        <select
          value={pick ?? ""}
          disabled={locked}
          onChange={(e) => onPick(match.id, e.target.value)}
          className="mt-2 min-h-[40px] w-full rounded-lg border border-pitch-mid bg-pitch px-2 py-1.5 text-sm text-cream disabled:opacity-50"
        >
          <option value="">{locked ? "Cerrado" : "— Ganador —"}</option>
          <option value={match.home}>{match.home}</option>
          <option value={match.away}>{match.away}</option>
        </select>
      )}

      {!interactive && pick && !winner && (
        <p className="mt-2 text-[10px] text-gold">Tu pick: {pick}</p>
      )}

      {winner && <p className="mt-1 text-[10px] text-lime">Ganador: {winner}</p>}
      {locked && reason && !winner && (
        <p className="mt-1 text-[10px] text-gold">{reason}</p>
      )}
    </div>
  );
}

export function KnockoutBracket({ picks, results = {}, onPick, interactive = false }: Props) {
  const bracket = useMemo(() => buildKnockoutBracket(), []);

  const round32ByDay = useMemo(() => {
    const r32 = bracket.find((r) => r.phase === "round32");
    if (!r32) return [];
    const map = new Map<string, typeof r32.slots>();
    for (const slot of r32.slots) {
      const day = getMatchCalendarDay(slot.match);
      const arr = map.get(day) ?? [];
      arr.push(slot);
      map.set(day, arr);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [bracket]);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="font-display text-lg text-gold">Dieciseisavos de final</h3>
        <p className="mt-1 text-xs text-muted">
          Cruces confirmados tras la fase de grupos. Los mejores terceros se definen al cierre de la
          jornada del 27 de junio.
        </p>
        <div className="mt-4 space-y-6">
          {round32ByDay.map(([day, slots]) => (
            <div key={day}>
              <h4 className="mb-3 text-sm capitalize text-muted">{formatMatchDayLabel(day)}</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {slots.map(({ match }) => (
                  <BracketMatchCard
                    key={match.id}
                    match={match}
                    result={results[match.id]}
                    pick={picks[match.id]}
                    results={results}
                    onPick={onPick}
                    interactive={interactive}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {bracket
        .filter((r) => r.phase !== "round32")
        .map((round) => (
          <section key={round.phase}>
            <h3 className="font-display text-lg text-gold">{round.label}</h3>
            <p className="mt-1 text-xs text-muted">
              {round.phase === "round16"
                ? "Octavos: se completan con los ganadores de los dieciseisavos."
                : round.phase === "final"
                  ? "Gran final del Mundial."
                  : "Los equipos se definen al cerrar la ronda anterior."}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {round.slots.map(({ match, feedsFrom }) => (
                <BracketMatchCard
                  key={match.id}
                  match={match}
                  result={results[match.id]}
                  pick={picks[match.id]}
                  feedsFrom={feedsFrom}
                  results={results}
                  onPick={onPick}
                  interactive={interactive}
                />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
