"use client";

import type { Match } from "@/lib/matches-data";
import { getMatchStatus, statusClass, statusLabel } from "@/lib/match-status";

type Props = {
  match: Match;
  result?: { homeScore: number | null; awayScore: number | null } | null;
};

export function MatchStatusBadge({ match, result }: Props) {
  const status = getMatchStatus(match, result);
  const score =
    result?.homeScore != null && result.awayScore != null
      ? `${result.homeScore}-${result.awayScore}`
      : null;

  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${statusClass(status)}`}>
      {score ?? statusLabel(status)}
    </span>
  );
}
