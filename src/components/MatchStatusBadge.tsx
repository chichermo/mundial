"use client";

import type { Match } from "@/lib/matches-data";
import { isHalftimeBettingGraceActive } from "@/lib/match-lock";
import { getMatchStatus, statusClass, statusLabel } from "@/lib/match-status";

type Props = {
  match: Match;
  matchId?: number;
  result?: { homeScore: number | null; awayScore: number | null } | null;
};

export function MatchStatusBadge({ match, matchId, result }: Props) {
  const id = matchId ?? match.id;
  const graceOpen = isHalftimeBettingGraceActive(id, match, result);
  const status = graceOpen ? null : getMatchStatus(match, result);
  const score =
    result?.homeScore != null && result.awayScore != null
      ? `${result.homeScore}-${result.awayScore}`
      : null;

  if (graceOpen) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-lime/15 px-1.5 py-0.5 text-[10px] text-lime">
        Apuestas abiertas
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${statusClass(status!)}`}>
      {score ?? statusLabel(status!)}
    </span>
  );
}
