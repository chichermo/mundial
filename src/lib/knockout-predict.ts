import type { Match } from "@/lib/matches-data";
import { teamShortName } from "@/lib/team-flags";
import { getMatchOutcome } from "@/lib/scoring";

export type KnockoutPickData = {
  winnerLabel?: string;
  homeScore?: number | null;
  awayScore?: number | null;
};

export function formatKnockoutPredictionDisplay(
  pred: Pick<KnockoutPickData, "homeScore" | "awayScore" | "winnerLabel">,
): string | null {
  if (pred.homeScore != null && pred.awayScore != null) {
    let label = `${pred.homeScore}-${pred.awayScore}`;
    if (pred.homeScore === pred.awayScore && pred.winnerLabel) {
      label += ` (${teamShortName(pred.winnerLabel)})`;
    }
    return label;
  }
  if (pred.winnerLabel) return pred.winnerLabel;
  return null;
}

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
