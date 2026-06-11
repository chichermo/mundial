import type { KnockoutPrediction, Member, TournamentPick } from "@prisma/client";
import { isMissingColumnError } from "@/lib/db-errors";
import { ensureDbSchema } from "@/lib/ensure-db-schema";
import { prisma } from "@/lib/prisma";

type PredictionRow = {
  matchId: number;
  homeScore: number;
  awayScore: number;
  homeScorers?: string;
  awayScorers?: string;
};

export type PollaMemberData = {
  member: Member & {
    matchPredictions: PredictionRow[];
    knockoutPredictions: KnockoutPrediction[];
    tournamentPick: TournamentPick | null;
  };
  hasScorerColumns: boolean;
};

export async function loadPollaMember(
  memberId: string,
  userId: string,
): Promise<PollaMemberData | null> {
  const hasScorerColumns = await ensureDbSchema();

  const baseWhere = { id: memberId, userId };
  const baseInclude = {
    knockoutPredictions: true,
    tournamentPick: true,
  } as const;

  if (hasScorerColumns) {
    try {
      const member = await prisma.member.findFirst({
        where: baseWhere,
        include: { ...baseInclude, matchPredictions: true },
      });
      if (member) return { member, hasScorerColumns: true };
      return null;
    } catch (err) {
      if (!isMissingColumnError(err)) throw err;
    }
  }

  const member = await prisma.member.findFirst({
    where: baseWhere,
    include: {
      ...baseInclude,
      matchPredictions: {
        select: { matchId: true, homeScore: true, awayScore: true },
      },
    },
  });

  if (!member) return null;
  return { member, hasScorerColumns: false };
}
