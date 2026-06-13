"use client";

import { useState } from "react";
import type { Match } from "@/lib/matches-data";
import { getMatchPoints } from "@/lib/scoring";
import { MatchCard, type PredictionData } from "@/components/MatchCard";
import { MatchStatusBadge } from "@/components/MatchStatusBadge";

type ResultMap = Record<number, { homeScore: number | null; awayScore: number | null }>;

type Props = {
  match: Match;
  prediction?: PredictionData;
  result: { homeScore: number; awayScore: number };
  onPredict?: (
    matchId: number,
    home: number,
    away: number,
    homeScorers: string[],
    awayScorers: string[],
  ) => Promise<void>;
  showSocial?: boolean;
};

function ptsClass(pts: number) {
  if (pts >= 5) return "text-lime font-semibold";
  if (pts >= 2) return "text-gold";
  return "text-muted";
}

export function PollaFinishedMatchRow({
  match,
  prediction,
  result,
  onPredict,
  showSocial,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const earnedPts = prediction ? getMatchPoints(prediction, result) : null;

  return (
    <div className="rounded-lg border border-pitch-mid/40 bg-pitch/40">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-col gap-2 px-3 py-3 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">
            <span className="font-mono text-gold">#{match.id}</span>
            {match.group ? ` · Grupo ${match.group}` : ""}
          </p>
          <p className="mt-0.5 text-sm text-cream">
            {match.home}{" "}
            <span className="font-display text-lg text-lime">
              {result.homeScore}-{result.awayScore}
            </span>{" "}
            {match.away}
          </p>
          {prediction && (
            <p className="mt-1 text-xs text-muted">
              Tu pronóstico: {prediction.homeScore}-{prediction.awayScore}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <MatchStatusBadge match={match} result={result} />
          {prediction && earnedPts != null && (
            <span className={`text-sm tabular-nums ${ptsClass(earnedPts)}`}>
              {earnedPts > 0 ? `+${earnedPts}` : "0"} pts
            </span>
          )}
          <span className="text-xs text-muted">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-pitch-mid/30 p-2 sm:p-3">
          <MatchCard
            match={match}
            showPrediction={Boolean(onPredict)}
            showSocial={showSocial}
            prediction={prediction}
            result={result}
            onPredict={onPredict}
          />
        </div>
      )}
    </div>
  );
}

export type { ResultMap };
