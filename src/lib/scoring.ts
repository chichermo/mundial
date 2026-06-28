import type { MatchPrediction, TournamentPick } from "@prisma/client";

/** Reglas polla Balsuos: L/E/V = 2 pts, marcador exacto = 5 pts */
export const SCORING_RULES = {
  exactScore: 5,
  correctResult: 2,
  knockoutWinner: 2,
  /** Bonus en empate: acertar quién clasifica (prórroga/penales). */
  knockoutAdvancer: 2,
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

export function getKnockoutPoints(
  pred: {
    homeScore: number | null;
    awayScore: number | null;
    winnerLabel: string;
  },
  result: { homeScore: number; awayScore: number; winnerLabel?: string | null } | null,
  options?: { winnerMatch?: (picked: string, official: string) => boolean },
): number {
  if (!result) return 0;

  if (pred.homeScore != null && pred.awayScore != null) {
    const exact =
      pred.homeScore === result.homeScore && pred.awayScore === result.awayScore;
    if (exact) return SCORING_RULES.exactScore;

    const resultPts = getMatchPoints(
      { homeScore: pred.homeScore, awayScore: pred.awayScore },
      { homeScore: result.homeScore, awayScore: result.awayScore },
    );
    if (resultPts === 0) return 0;

    const predDraw = pred.homeScore === pred.awayScore;
    const resDraw = result.homeScore === result.awayScore;
    if (
      predDraw &&
      resDraw &&
      result.winnerLabel &&
      pred.winnerLabel &&
      (options?.winnerMatch ?? ((a, b) => a === b))(pred.winnerLabel, result.winnerLabel)
    ) {
      return resultPts + SCORING_RULES.knockoutAdvancer;
    }

    return resultPts;
  }

  if (result.winnerLabel && pred.winnerLabel) {
    const matchWinner = options?.winnerMatch ?? ((a, b) => a === b);
    return matchWinner(pred.winnerLabel, result.winnerLabel) ? SCORING_RULES.knockoutWinner : 0;
  }

  return 0;
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
