"use client";

import { useEffect, useState } from "react";
import type { Match } from "@/lib/matches-data";
import { getPhaseLabel } from "@/lib/matches-data";
import { isPredictionLocked, lockReason } from "@/lib/match-lock";
import { resizeScorerSlots } from "@/lib/scorers";
import { getMatchPoints } from "@/lib/scoring";
import { useCountdown } from "@/hooks/useCountdown";
import { BroadcastPanel } from "./BroadcastPanel";
import { MatchComments } from "./MatchComments";
import { MatchCompare } from "./MatchCompare";
import { MatchStatusBadge } from "./MatchStatusBadge";
import { TimezoneStrip } from "./TimezoneStrip";

export type PredictionData = {
  homeScore: number;
  awayScore: number;
  homeScorers?: string[];
  awayScorers?: string[];
};

type Props = {
  match: Match;
  prediction?: PredictionData;
  onPredict?: (
    matchId: number,
    home: number,
    away: number,
    homeScorers: string[],
    awayScorers: string[],
  ) => Promise<void>;
  showPrediction?: boolean;
  showSocial?: boolean;
  result?: { homeScore: number | null; awayScore: number | null } | null;
};

const MAX_GOALS = 15;

function formatScoreInput(score: number | undefined): string {
  return score == null ? "" : String(score);
}

function sanitizeScoreInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 2);
  if (digits === "") return "";
  return String(Math.min(MAX_GOALS, Number.parseInt(digits, 10)));
}

function parseScoreInput(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0 || n > MAX_GOALS) return null;
  return n;
}

function ScorerInputs({
  teamLabel,
  count,
  values,
  disabled,
  onChange,
}: {
  teamLabel: string;
  count: number;
  values: string[];
  disabled: boolean;
  onChange: (next: string[]) => void;
}) {
  if (count <= 0) return null;

  return (
    <div className="w-full space-y-2">
      <p className="text-xs text-muted">
        Goleadores {teamLabel} ({count} {count === 1 ? "gol" : "goles"})
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {values.map((val, i) => (
          <input
            key={i}
            type="text"
            maxLength={80}
            disabled={disabled}
            value={val}
            placeholder={`Jugador ${i + 1}`}
            onChange={(e) => {
              const next = [...values];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="min-h-10 flex-1 rounded-lg border border-pitch-mid bg-pitch px-3 py-2 text-sm text-cream disabled:opacity-50 sm:min-w-[140px] sm:max-w-[200px]"
          />
        ))}
      </div>
    </div>
  );
}

export function MatchCard({
  match,
  prediction,
  onPredict,
  showPrediction,
  showSocial,
  result,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [homeInput, setHomeInput] = useState(() => formatScoreInput(prediction?.homeScore));
  const [awayInput, setAwayInput] = useState(() => formatScoreInput(prediction?.awayScore));
  const homeGoals = parseScoreInput(homeInput) ?? 0;
  const awayGoals = parseScoreInput(awayInput) ?? 0;
  const [homeScorers, setHomeScorers] = useState<string[]>(
    resizeScorerSlots(prediction?.homeScorers ?? [], prediction?.homeScore ?? 0),
  );
  const [awayScorers, setAwayScorers] = useState<string[]>(
    resizeScorerSlots(prediction?.awayScorers ?? [], prediction?.awayScore ?? 0),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const locked = isPredictionLocked(match, result);
  const closedLabel = lockReason(match, result);
  const countdown = useCountdown(match.date, match.kickoffEst, !result?.homeScore);

  useEffect(() => {
    setHomeInput(formatScoreInput(prediction?.homeScore));
    setAwayInput(formatScoreInput(prediction?.awayScore));
  }, [prediction?.homeScore, prediction?.awayScore]);

  useEffect(() => {
    setHomeScorers((prev) => resizeScorerSlots(prev, homeGoals));
  }, [homeGoals]);

  useEffect(() => {
    setAwayScorers((prev) => resizeScorerSlots(prev, awayGoals));
  }, [awayGoals]);

  async function save() {
    if (!onPredict || locked) return;
    const home = parseScoreInput(homeInput);
    const away = parseScoreInput(awayInput);
    if (home == null || away == null) {
      setError("Ingresa el marcador completo (local y visitante).");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onPredict(match.id, home, away, homeScorers, awayScorers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  const savedScorers =
    prediction &&
    ((prediction.homeScorers?.length ?? 0) > 0 || (prediction.awayScorers?.length ?? 0) > 0);

  const officialResult =
    result?.homeScore != null && result?.awayScore != null
      ? { homeScore: result.homeScore, awayScore: result.awayScore }
      : null;
  const earnedPts =
    prediction && officialResult ? getMatchPoints(prediction, officialResult) : null;

  return (
    <article
      id={`partido-${match.id}`}
      className="card-pitch scroll-mt-24 overflow-hidden transition-shadow hover:shadow-[0_0_32px_rgba(125,255,79,0.08)]"
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between md:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="shrink-0 font-display text-2xl text-lime/80 sm:text-3xl">
            #{match.id}
          </span>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted">
              {match.group ? `Grupo ${match.group}` : getPhaseLabel(match.phase)}
            </p>
            <p className="font-display text-xl leading-tight sm:text-2xl md:text-3xl">
              <span className="block text-cream sm:inline">{match.home}</span>
              <span className="mx-0 block text-center text-muted sm:mx-2 sm:inline">vs</span>
              <span className="block text-cream sm:inline">{match.away}</span>
            </p>
          </div>
        </div>
        <div className="shrink-0 text-left text-xs text-muted sm:text-right">
          <div className="mb-1 flex flex-wrap gap-1 sm:justify-end">
            <MatchStatusBadge match={match} result={result} />
            {countdown && !locked && <span className="text-gold">{countdown}</span>}
            {locked && closedLabel && (
              <span className="rounded bg-pitch-mid/80 px-2 py-0.5 text-gold">{closedLabel}</span>
            )}
          </div>
          <p className="break-words">{match.venue}</p>
          <p>{match.city}</p>
        </div>
      </div>

      <div className="border-t border-pitch-mid/40 px-3 py-3 sm:px-4 md:px-5">
        <TimezoneStrip date={match.date} kickoffEst={match.kickoffEst} />
      </div>

      {showPrediction && onPredict && (
        <div className="flex flex-col gap-4 border-t border-pitch-mid/40 bg-pitch/40 px-3 py-4 sm:px-4 md:px-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-full text-sm text-muted sm:w-auto">Marcador</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={2}
                value={homeInput}
                disabled={locked}
                placeholder="0"
                onChange={(e) => setHomeInput(sanitizeScoreInput(e.target.value))}
                className="h-11 w-14 rounded-lg border border-pitch-mid bg-pitch px-2 text-center text-lg text-cream focus:ring-2 focus:ring-lime disabled:opacity-50"
                aria-label={`Goles ${match.home}`}
              />
              <span className="text-muted">-</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={2}
                value={awayInput}
                disabled={locked}
                placeholder="0"
                onChange={(e) => setAwayInput(sanitizeScoreInput(e.target.value))}
                className="h-11 w-14 rounded-lg border border-pitch-mid bg-pitch px-2 text-center text-lg text-cream focus:ring-2 focus:ring-lime disabled:opacity-50"
                aria-label={`Goles ${match.away}`}
              />
            </div>
            <button
              type="button"
              onClick={save}
              disabled={locked || saving || homeInput === "" || awayInput === ""}
              className="btn-primary w-full text-sm sm:ml-auto sm:w-auto sm:!min-h-10"
            >
              {locked ? "Cerrado" : saving ? "Guardando…" : "Guardar"}
            </button>
          </div>

          <ScorerInputs
            teamLabel={match.home}
            count={homeGoals}
            values={homeScorers}
            disabled={locked}
            onChange={setHomeScorers}
          />
          <ScorerInputs
            teamLabel={match.away}
            count={awayGoals}
            values={awayScorers}
            disabled={locked}
            onChange={setAwayScorers}
          />

          {prediction && (
            <p className="text-xs text-muted">
              Tu pronóstico: {prediction.homeScore}-{prediction.awayScore}
              {savedScorers && " · con goleadores"}
            </p>
          )}
          {officialResult && (
            <p className="text-xs text-cream">
              Resultado oficial: {officialResult.homeScore}-{officialResult.awayScore}
              {prediction && earnedPts != null && (
                <span className={`ml-2 font-semibold ${earnedPts >= 5 ? "text-lime" : earnedPts >= 2 ? "text-gold" : "text-muted"}`}>
                  {earnedPts > 0 ? `+${earnedPts} pts` : "0 pts"}
                </span>
              )}
            </p>
          )}
          {error && <p className="text-xs text-red-300">{error}</p>}
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full min-h-[44px] border-t border-pitch-mid/40 px-3 py-3 text-xs font-medium text-lime active:bg-pitch-mid/40 hover:bg-pitch-mid/30 sm:px-4 md:px-5"
        aria-expanded={expanded}
      >
        {expanded ? "Ocultar transmisión" : "Ver transmisión (CL · ES · BE)"}
      </button>

      {expanded && (
        <div className="px-3 pb-4 sm:px-4 md:px-5">
          <BroadcastPanel broadcast={match.broadcast} />
          {showSocial && (
            <>
              <MatchCompare matchId={match.id} />
              <MatchComments matchId={match.id} />
            </>
          )}
        </div>
      )}
    </article>
  );
}
