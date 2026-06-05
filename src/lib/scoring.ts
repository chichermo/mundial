import type { MatchPrediction, TournamentPick } from "@prisma/client";

/** Reglas polla Balsuos: L/E/V = 2 pts, marcador exacto = 5 pts */
export const SCORING_RULES = {
  exactScore: 5,
  correctResult: 2,
  knockoutWinner: 2,
  champion: 10,
  surprise: 6,
  revelationTeam: 6,
  topScorer: 8,
  revelationPlayer: 6,
} as const;

export type MatchOutcome = "L" | "E" | "V";

export function getMatchOutcome(homeScore: number, awayScore: number): MatchOutcome {
  if (homeScore > awayScore) return "L";
  if (homeScore < awayScore) return "V";
  return "E";
}

export function getMatchPoints(
  pred: Pick<MatchPrediction, "homeScore" | "awayScore">,
  result: { homeScore: number; awayScore: number } | null,
): number {
  if (!result) return 0;
  if (pred.homeScore === result.homeScore && pred.awayScore === result.awayScore) {
    return SCORING_RULES.exactScore;
  }
  const predDiff = Math.sign(pred.homeScore - pred.awayScore);
  const resDiff = Math.sign(result.homeScore - result.awayScore);
  return predDiff === resDiff ? SCORING_RULES.correctResult : 0;
}

export function getTournamentPoints(
  pick: TournamentPick | null,
  answers: {
    champion?: string | null;
    surprise?: string | null;
    revelationTeam?: string | null;
    topScorer?: string | null;
    revelationPlayer?: string | null;
  },
): number {
  if (!pick) return 0;
  let pts = 0;
  if (answers.champion && pick.champion === answers.champion) pts += SCORING_RULES.champion;
  if (answers.surprise && pick.surprise === answers.surprise) pts += SCORING_RULES.surprise;
  if (answers.revelationTeam && pick.revelationTeam === answers.revelationTeam)
    pts += SCORING_RULES.revelationTeam;
  if (answers.topScorer && pick.topScorer === answers.topScorer) pts += SCORING_RULES.topScorer;
  if (answers.revelationPlayer && pick.revelationPlayer === answers.revelationPlayer)
    pts += SCORING_RULES.revelationPlayer;
  return pts;
}
