"use client";

import { useEffect, useMemo, useState } from "react";
import type { Match } from "@/lib/matches-data";
import {
  buildKnockoutBracket,
  getWinnerName,
  resolveFeederLabel,
  type BracketMatchResult,
} from "@/lib/knockout-bracket";
import type { KnockoutPickData } from "@/lib/knockout-predict";
import { isPredictionLocked, lockReason } from "@/lib/match-lock";
import { formatMatchDayLabel, getMatchCalendarDay } from "@/lib/match-order";
import {
  formatScoreInput,
  parseScoreInput,
  sanitizeScoreInput,
} from "@/lib/score-input";
import { getKnockoutPoints } from "@/lib/scoring";
import { formatKickoffInZone } from "@/lib/timezones";

type ResultMap = Record<number, BracketMatchResult | undefined>;

type Props = {
  picks: Record<number, KnockoutPickData>;
  results?: ResultMap;
  onPick?: (matchId: number, home: number, away: number, winnerLabel?: string) => Promise<void>;
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
  pick?: KnockoutPickData;
  feedsFrom?: [number, number];
  results: ResultMap;
  onPick?: Props["onPick"];
  interactive?: boolean;
}) {
  const locked = isPredictionLocked(match, result, match.id);
  const reason = lockReason(match, result, match.id);
  const winner = getWinnerName(match, result);
  const { time, dateLabel } = formatKickoffInZone(
    match.date,
    match.kickoffEst,
    "America/Santiago",
  );

  const [homeInput, setHomeInput] = useState(() => formatScoreInput(pick?.homeScore));
  const [awayInput, setAwayInput] = useState(() => formatScoreInput(pick?.awayScore));
  const [tieWinner, setTieWinner] = useState(pick?.winnerLabel ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setHomeInput(formatScoreInput(pick?.homeScore));
    setAwayInput(formatScoreInput(pick?.awayScore));
    setTieWinner(pick?.winnerLabel ?? "");
  }, [pick?.homeScore, pick?.awayScore, pick?.winnerLabel]);

  const homeParsed = parseScoreInput(homeInput);
  const awayParsed = parseScoreInput(awayInput);
  const isTiePick = homeParsed != null && awayParsed != null && homeParsed === awayParsed;

  const officialResult =
    result?.homeScore != null && result?.awayScore != null
      ? {
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          winnerLabel: result.winnerLabel,
        }
      : null;

  const earnedPts =
    pick?.homeScore != null && pick?.awayScore != null && officialResult
      ? getKnockoutPoints(
          {
            homeScore: pick.homeScore,
            awayScore: pick.awayScore,
            winnerLabel: pick.winnerLabel ?? "",
          },
          officialResult,
        )
      : null;

  async function save() {
    if (!onPick || locked) return;
    const home = parseScoreInput(homeInput);
    const away = parseScoreInput(awayInput);
    if (home == null || away == null) {
      setError("Ingresa el marcador completo.");
      return;
    }
    if (home === away && !tieWinner) {
      setError("Si pronosticas empate, elige quién clasifica.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onPick(match.id, home, away, home === away ? tieWinner : undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

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
        <div className="mt-3 space-y-2 border-t border-pitch-mid/40 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">Marcador</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={homeInput}
              disabled={locked}
              placeholder="0"
              onChange={(e) => setHomeInput(sanitizeScoreInput(e.target.value))}
              className="h-10 w-12 rounded-lg border border-pitch-mid bg-pitch px-1 text-center text-cream disabled:opacity-50"
              aria-label={`Goles ${match.home}`}
            />
            <span className="text-muted">-</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={awayInput}
              disabled={locked}
              placeholder="0"
              onChange={(e) => setAwayInput(sanitizeScoreInput(e.target.value))}
              className="h-10 w-12 rounded-lg border border-pitch-mid bg-pitch px-1 text-center text-cream disabled:opacity-50"
              aria-label={`Goles ${match.away}`}
            />
            <button
              type="button"
              onClick={save}
              disabled={locked || saving || homeInput === "" || awayInput === ""}
              className="btn-primary ml-auto min-h-9 px-3 text-xs"
            >
              {locked ? "Cerrado" : saving ? "…" : "Guardar"}
            </button>
          </div>
          {isTiePick && !locked && (
            <select
              value={tieWinner}
              onChange={(e) => setTieWinner(e.target.value)}
              className="min-h-9 w-full rounded-lg border border-pitch-mid bg-pitch px-2 py-1 text-xs text-cream"
            >
              <option value="">— Quién clasifica —</option>
              <option value={match.home}>{match.home}</option>
              <option value={match.away}>{match.away}</option>
            </select>
          )}
          {error && <p className="text-[10px] text-red-300">{error}</p>}
        </div>
      )}

      {!interactive && pick?.homeScore != null && pick?.awayScore != null && (
        <p className="mt-2 text-[10px] text-gold">
          Tu marcador: {pick.homeScore}-{pick.awayScore}
          {pick.homeScore === pick.awayScore && pick.winnerLabel
            ? ` · clasifica ${pick.winnerLabel}`
            : ""}
        </p>
      )}

      {officialResult && (
        <p className="mt-1 text-[10px] text-cream">
          Oficial: {officialResult.homeScore}-{officialResult.awayScore}
          {earnedPts != null && (
            <span
              className={`ml-1 font-semibold ${earnedPts >= 5 ? "text-lime" : earnedPts >= 2 ? "text-gold" : "text-muted"}`}
            >
              {earnedPts > 0 ? `+${earnedPts} pts` : "0 pts"}
            </span>
          )}
        </p>
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
          Pronostica el marcador: +5 exacto, +2 L/E/V (igual que fase de grupos). Si empatas, indica
          quién clasifica.
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
