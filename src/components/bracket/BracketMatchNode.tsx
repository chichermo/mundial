"use client";

import { useEffect, useState } from "react";
import { BroadcastPanel } from "@/components/BroadcastPanel";
import { MatchComments } from "@/components/MatchComments";
import { MatchCompare } from "@/components/MatchCompare";
import { MatchStatusBadge } from "@/components/MatchStatusBadge";
import { TimezoneStrip } from "@/components/TimezoneStrip";
import { TeamFlag } from "@/components/bracket/TeamFlag";
import { useCountdown } from "@/hooks/useCountdown";
import { getMatch } from "@/lib/matches-data";
import type { BracketMatchResult } from "@/lib/knockout-bracket";
import { knockoutLabelsMatch } from "@/lib/knockout-labels";
import { isPredictionLocked, lockReason } from "@/lib/match-lock";
import {
  formatKnockoutPredictionDisplay,
  type KnockoutPickData,
} from "@/lib/knockout-predict";
import { resolveDisplayTeams } from "@/lib/knockout-rounds";
import {
  formatScoreInput,
  parseScoreInput,
  sanitizeScoreInput,
} from "@/lib/score-input";
import { getKnockoutPoints, SCORING_RULES } from "@/lib/scoring";
import { formatKickoffInZone } from "@/lib/timezones";
import { teamShortName } from "@/lib/team-flags";

type Props = {
  matchId: number;
  results: Record<number, BracketMatchResult | undefined>;
  pick?: KnockoutPickData;
  interactive?: boolean;
  onSave?: (matchId: number, home: number, away: number, winnerLabel?: string) => Promise<void>;
  compact?: boolean;
  showSocial?: boolean;
};

export function BracketMatchNode({
  matchId,
  results,
  pick,
  interactive,
  onSave,
  compact,
  showSocial = false,
}: Props) {
  const match = getMatch(matchId);
  const result = results[matchId];
  const teams = match ? resolveDisplayTeams(matchId, results) : { home: "?", away: "?" };
  const { home, away } = teams;
  const locked = match ? isPredictionLocked(match, result, matchId) : true;
  const reason = match ? lockReason(match, result, matchId) : "";
  const countdown = useCountdown(
    match?.date ?? "",
    match?.kickoffEst ?? "",
    Boolean(match && !result?.homeScore),
  );

  const [expanded, setExpanded] = useState(false);
  const [homeInput, setHomeInput] = useState(() => formatScoreInput(pick?.homeScore));
  const [awayInput, setAwayInput] = useState(() => formatScoreInput(pick?.awayScore));
  const [advancer, setAdvancer] = useState(pick?.winnerLabel ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setHomeInput(formatScoreInput(pick?.homeScore));
    setAwayInput(formatScoreInput(pick?.awayScore));
    setAdvancer(pick?.winnerLabel ?? "");
  }, [pick?.homeScore, pick?.awayScore, pick?.winnerLabel]);

  if (!match) return null;

  const { time, dateLabel } = formatKickoffInZone(
    match.date,
    match.kickoffEst,
    "America/Santiago",
  );

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
          {
            homeScore: pick.homeScore,
            awayScore: pick.awayScore,
            winnerLabel: pick.winnerLabel ?? "",
          },
          official,
          { winnerMatch: knockoutLabelsMatch },
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
    if (h === a && !advancer) {
      setError("Si empatas, elige quién clasifica");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(matchId, h, a, h === a ? advancer : undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  const showOfficial = official && !interactive;
  const pickLabel = pick ? formatKnockoutPredictionDisplay(pick) : null;
  const canEdit = interactive && onSave && !locked;

  return (
    <div
      id={`partido-${matchId}`}
      className={`relative scroll-mt-24 rounded-xl border bg-pitch/60 ${
        winner
          ? "border-lime/50 shadow-[0_0_20px_rgba(125,255,79,0.08)]"
          : locked
            ? "border-pitch-mid/50 bg-pitch/40"
            : "border-pitch-mid/60"
      } ${compact ? "text-xs" : "text-sm"}`}
    >
      <div className="p-2.5 sm:p-3">
        <div className="mb-2 flex flex-wrap items-center justify-center gap-1.5">
          <span className="font-display text-sm text-lime">#{matchId}</span>
          <MatchStatusBadge match={match} matchId={matchId} result={result} />
          {countdown && !locked && (
            <span className="text-[10px] text-gold">{countdown}</span>
          )}
          {reason && (
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] ${
                locked ? "bg-pitch-mid/80 text-gold" : "bg-lime/15 text-lime"
              }`}
            >
              {reason}
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <TeamBadge
            name={home}
            score={showOfficial ? official.homeScore : pick?.homeScore}
            winner={winner === home}
            selected={advancer === home}
          />
          <div className="flex flex-col items-center gap-1">
            <span className="rounded bg-ink px-2 py-0.5 text-[10px] font-bold text-cream">VS</span>
            {official && earnedPts != null && (
              <span
                className={`text-[10px] font-semibold ${
                  earnedPts >= SCORING_RULES.exactScore
                    ? "text-lime"
                    : earnedPts >= SCORING_RULES.correctResult
                      ? "text-gold"
                      : "text-muted"
                }`}
              >
                {earnedPts > 0 ? `+${earnedPts}` : "0"}
              </span>
            )}
          </div>
          <TeamBadge
            name={away}
            score={showOfficial ? official.awayScore : pick?.awayScore}
            winner={winner === away}
            selected={advancer === away}
          />
        </div>

        <p className="mt-2 text-center text-[10px] text-muted">
          {dateLabel} · {time} Chile
        </p>
        <p className="text-center text-[10px] text-muted">
          {match.venue} · {match.city}
        </p>

        {canEdit && (
          <div className="mt-3 space-y-2.5 border-t border-pitch-mid/40 pt-2">
            <p className="text-center text-[10px] text-muted">Marcador (90&apos; + prórroga)</p>
            <div className="flex items-center justify-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={homeInput}
                onChange={(e) => setHomeInput(sanitizeScoreInput(e.target.value))}
                className="h-9 w-10 rounded-lg border border-pitch-mid bg-pitch text-center text-cream focus:ring-2 focus:ring-lime"
                aria-label={`Goles ${home}`}
              />
              <span className="text-muted">-</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={awayInput}
                onChange={(e) => setAwayInput(sanitizeScoreInput(e.target.value))}
                className="h-9 w-10 rounded-lg border border-pitch-mid bg-pitch text-center text-cream focus:ring-2 focus:ring-lime"
                aria-label={`Goles ${away}`}
              />
              <button
                type="button"
                onClick={save}
                disabled={saving || homeInput === "" || awayInput === ""}
                className="btn-primary min-h-9 px-2 text-[10px]"
              >
                {saving ? "…" : "Guardar"}
              </button>
            </div>

            <div className="space-y-1.5">
              <p className="text-center text-[10px] text-gold">
                Quién clasifica{isTiePick ? " · obligatorio" : " · si empatas"}
              </p>
              <div className="flex justify-center gap-2">
                <AdvancerButton
                  team={home}
                  active={advancer === home}
                  onClick={() => setAdvancer(home)}
                />
                <AdvancerButton
                  team={away}
                  active={advancer === away}
                  onClick={() => setAdvancer(away)}
                />
              </div>
            </div>

            {error && <p className="text-center text-[10px] text-red-300">{error}</p>}
          </div>
        )}

        {interactive && locked && pickLabel && (
          <p className="mt-2 text-center text-[10px] text-gold">Tu pronóstico: {pickLabel}</p>
        )}

        {official && (
          <p className="mt-2 text-center text-[10px] text-lime">
            Oficial: {official.homeScore}-{official.awayScore}
            {winner ? ` · ${teamShortName(winner)}` : ""}
          </p>
        )}

        {!interactive && pickLabel && !showOfficial && (
          <p className="mt-2 text-center text-[10px] text-gold">Tu pick: {pickLabel}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full min-h-[36px] border-t border-pitch-mid/40 px-2 py-2 text-[10px] font-medium text-lime hover:bg-pitch-mid/30"
        aria-expanded={expanded}
      >
        {expanded ? "Ocultar detalles" : "Horario · transmisión · grupo"}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-pitch-mid/40 px-2.5 pb-3 pt-2 sm:px-3">
          <TimezoneStrip date={match.date} kickoffEst={match.kickoffEst} highlight="chile" />
          <BroadcastPanel broadcast={match.broadcast} />
          {showSocial && (
            <>
              <MatchCompare matchId={matchId} />
              <MatchComments matchId={matchId} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AdvancerButton({
  team,
  active,
  disabled,
  onClick,
}: {
  team: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-1.5 transition-colors disabled:opacity-50 ${
        active
          ? "border-lime bg-lime/15 ring-1 ring-lime/40"
          : "border-pitch-mid/80 bg-pitch/80 hover:border-gold/50"
      }`}
      title={`Clasifica ${team}`}
    >
      <TeamFlag team={team} size="sm" />
      <span className="max-w-[72px] truncate text-[10px] text-cream">{teamShortName(team)}</span>
    </button>
  );
}

function TeamBadge({
  name,
  score,
  winner,
  selected,
}: {
  name: string;
  score?: number | null;
  winner?: boolean;
  selected?: boolean;
}) {
  return (
    <div className="flex w-[76px] flex-col items-center gap-1 sm:w-20">
      <div
        className={`overflow-hidden rounded-lg border-2 ${
          winner
            ? "border-lime shadow-[0_0_12px_rgba(125,255,79,0.35)]"
            : selected
              ? "border-gold ring-1 ring-gold/40"
              : "border-pitch-mid/80"
        }`}
      >
        <TeamFlag team={name} size="md" className="block w-[56px] sm:w-[64px]" />
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
