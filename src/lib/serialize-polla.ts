import type { MatchPrediction, TournamentPick } from "@prisma/client";
import { parseScorersJson } from "@/lib/scorers";

export type TournamentPickProps = {
  champion?: string | null;
  surprise?: string | null;
  revelationTeam?: string | null;
  topScorer?: string | null;
  revelationPlayer?: string | null;
};

export type PredictionProps = {
  matchId: number;
  homeScore: number;
  awayScore: number;
  homeScorers: string[];
  awayScorers: string[];
};

type PredictionLike = Pick<MatchPrediction, "matchId" | "homeScore" | "awayScore"> & {
  homeScorers?: string | null;
  awayScorers?: string | null;
};

/** Solo campos serializables para Client Components (sin Date ni ids de Prisma). */
export function serializeTournamentPick(
  pick: TournamentPick | null | undefined,
): TournamentPickProps {
  if (!pick) return {};
  return {
    champion: pick.champion,
    surprise: pick.surprise,
    revelationTeam: pick.revelationTeam,
    topScorer: pick.topScorer,
    revelationPlayer: pick.revelationPlayer,
  };
}

export function serializePredictions(predictions: PredictionLike[]): PredictionProps[] {
  return predictions.map((p) => ({
    matchId: p.matchId,
    homeScore: p.homeScore,
    awayScore: p.awayScore,
    homeScorers: parseScorersJson(p.homeScorers),
    awayScorers: parseScorersJson(p.awayScorers),
  }));
}
