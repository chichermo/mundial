"use client";

import { useEffect, useState } from "react";
import { getMatch } from "@/lib/matches-data";
import type { BracketMatchResult } from "@/lib/knockout-bracket";
import { isPredictionLocked, lockReason } from "@/lib/match-lock";
import type { KnockoutPickData } from "@/lib/knockout-predict";
import { resolveDisplayTeams } from "@/lib/knockout-rounds";
import {
  formatScoreInput,
  parseScoreInput,
  sanitizeScoreInput,
} from "@/lib/score-input";
import { getKnockoutPoints } from "@/lib/scoring";
import { teamFlag, teamShortName } from "@/lib/team-flags";

type Props = {
  matchId: number;
  results: Record<number, BracketMatchResult | undefined>;
  pick?: KnockoutPickData;
  interactive?: boolean;
  onSave?: (matchId: number, home: number, away: number, winnerLabel?: string) => Promise<void>;
  compact?: boolean;
};

export function BracketMatchNode({
  matchId,
  results,
  pick,
  interactive,
  onSave,
  compact,
}: Props) {
  const match = getMatch(matchId);
  const result = results[matchId];
  const teams = match ? resolveDisplayTeams(matchId, results) : { home: "?", away: "?" };
  const { home, away } = teams;
  const locked = match ? isPredictionLocked(match, result) : true;
  const reason = match ? lockReason(match, result) : "";

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

  if (!match) return null;

  const homeParsed = parseScoreInput(homeInput);
  const awayParsed = parseScoreInput(awayInput);
  const isTiePick = homeParsed != null && awayParsed != null && homeParsed === awayParsed;

  const official =
    result?.homeScore != null && result?.awayScore != null
      ? { homeScore: result.homeScore, awayScore: result.awayScore, winnerLabel: result.winnerLabel }
      : null;

  const earnedPts =
    pick?.homeScore != null && pick?.awayScore != null && official
      ? getKnockoutPoints(
          { homeScore: pick.homeScore, awayScore: pick.awayScore, winnerLabel: pick.winnerLabel ?? "" },
          official,
        )
      : null;

  const winner =
    result?.winnerLabel ??
    (official && official.homeScore !== official.awayScore
      ? official.homeScore > official.awayScore
        ? home
        : away
      : null);

  async function save() {
    if (!onSave || locked) return;
    const h = parseScoreInput(homeInput);
    const a = parseScoreInput(awayInput);
    if (h == null || a == null) {
      setError("Marcador incompleto");
      return;
    }
    if (h === a && !tieWinner) {
      setError("Elige quién clasifica");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(matchId, h, a, h === a ? tieWinner : undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  const showOfficial = official && !interactive;

  return (
    <div
      id={`partido-${matchId}`}
      className={`relative rounded-xl border bg-pitch/60 p-2.5 sm:p-3 ${
        winner ? "border-lime/50 shadow-[0_0_20px_rgba(125,255,79,0.08)]" : "border-pitch-mid/60"
      } ${compact ? "text-xs" : "text-sm"}`}
    >
      <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-wider text-gold">
        #{matchId}
      </p>

      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <TeamBadge
          name={home}
          score={showOfficial ? official.homeScore : pick?.homeScore}
          winner={winner === home}
        />
        <div className="flex flex-col items-center gap-1">
          <span className="rounded bg-ink px-2 py-0.5 text-[10px] font-bold text-cream">VS</span>
          {showOfficial && earnedPts != null && (
            <span className={`text-[10px] font-semibold ${earnedPts >= 5 ? "text-lime" : earnedPts >= 2 ? "text-gold" : "text-muted"}`}>
              {earnedPts > 0 ? `+${earnedPts}` : "0"}
            </span>
          )}
        </div>
        <TeamBadge
          name={away}
          score={showOfficial ? official.awayScore : pick?.awayScore}
          winner={winner === away}
        />
      </div>

      {interactive && onSave && !locked && (
        <div className="mt-3 space-y-2 border-t border-pitch-mid/40 pt-2">
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={homeInput}
              onChange={(e) => setHomeInput(sanitizeScoreInput(e.target.value))}
              className="h-9 w-10 rounded-lg border border-pitch-mid bg-pitch text-center text-cream"
              aria-label={`Goles ${home}`}
            />
            <span className="text-muted">-</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={awayInput}
              onChange={(e) => setAwayInput(sanitizeScoreInput(e.target.value))}
              className="h-9 w-10 rounded-lg border border-pitch-mid bg-pitch text-center text-cream"
              aria-label={`Goles ${away}`}
            />
            <button
              type="button"
              onClick={save}
              disabled={saving || homeInput === "" || awayInput === ""}
              className="btn-primary min-h-9 px-2 text-[10px]"
            >
              {saving ? "…" : "OK"}
            </button>
          </div>
          {isTiePick && (
            <select
              value={tieWinner}
              onChange={(e) => setTieWinner(e.target.value)}
              className="w-full rounded-lg border border-pitch-mid bg-pitch px-2 py-1 text-[10px] text-cream"
            >
              <option value="">Clasifica…</option>
              <option value={home}>{teamShortName(home)}</option>
              <option value={away}>{teamShortName(away)}</option>
            </select>
          )}
          {error && <p className="text-center text-[10px] text-red-300">{error}</p>}
        </div>
      )}

      {locked && reason && !winner && (
        <p className="mt-2 text-center text-[10px] text-gold">{reason}</p>
      )}

      {showOfficial && (
        <p className="mt-2 text-center text-[10px] text-lime">
          {official.homeScore}-{official.awayScore}
          {winner ? ` · ${teamShortName(winner)}` : ""}
        </p>
      )}

      {!interactive && pick?.homeScore != null && pick?.awayScore != null && !showOfficial && (
        <p className="mt-2 text-center text-[10px] text-gold">
          Tu pick: {pick.homeScore}-{pick.awayScore}
        </p>
      )}
    </div>
  );
}

function TeamBadge({
  name,
  score,
  winner,
}: {
  name: string;
  score?: number | null;
  winner?: boolean;
}) {
  return (
    <div
      className={`flex w-[72px] flex-col items-center gap-1 sm:w-20 ${
        winner ? "opacity-100" : ""
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 bg-pitch-light text-2xl sm:h-14 sm:w-14 sm:text-3xl ${
          winner ? "border-lime shadow-[0_0_12px_rgba(125,255,79,0.35)]" : "border-pitch-mid/80"
        }`}
      >
        {teamFlag(name)}
      </div>
      <span
        className={`max-w-full truncate text-center text-[10px] leading-tight sm:text-xs ${
          winner ? "font-semibold text-lime" : "text-cream"
        }`}
        title={name}
      >
        {teamShortName(name)}
      </span>
      {score != null && (
        <span className="font-display text-lg text-gold">{score}</span>
      )}
    </div>
  );
}
