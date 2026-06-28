import type { Match } from "@/lib/matches-data";
import { getMatchOutcome } from "@/lib/scoring";

export type KnockoutPickData = {
  winnerLabel?: string;
  homeScore?: number | null;
  awayScore?: number | null;
};

export function deriveKnockoutWinnerLabel(
  match: Pick<Match, "home" | "away">,
  homeScore: number,
  awayScore: number,
): string {
  const outcome = getMatchOutcome(homeScore, awayScore);
  if (outcome === "L") return match.home;
  if (outcome === "V") return match.away;
  return "";
}

export function hasKnockoutScorePick(pick?: KnockoutPickData | null): boolean {
  return pick?.homeScore != null && pick?.awayScore != null;
}
