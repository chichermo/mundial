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

type KnockoutRow = Pick<KnockoutPrediction, "matchId" | "winnerLabel"> &
  Partial<Pick<KnockoutPrediction, "homeScore" | "awayScore">>;

export type PollaMemberData = {
  member: Member & {
    matchPredictions: PredictionRow[];
    knockoutPredictions: KnockoutRow[];
    tournamentPick: TournamentPick | null;
  };
  hasScorerColumns: boolean;
};

const KNOCKOUT_FULL = { knockoutPredictions: true } as const;
const KNOCKOUT_LEGACY = {
  knockoutPredictions: { select: { matchId: true, winnerLabel: true } },
} as const;

export async function loadPollaMember(
  memberId: string,
  userId: string,
): Promise<PollaMemberData | null> {
  const hasScorerColumns = await ensureDbSchema();

  const baseWhere = { id: memberId, userId };
  const tournamentInclude = { tournamentPick: true } as const;

  if (hasScorerColumns) {
    try {
      const member = await prisma.member.findFirst({
        where: baseWhere,
        include: { ...KNOCKOUT_FULL, ...tournamentInclude, matchPredictions: true },
      });
      if (member) return { member, hasScorerColumns: true };
      return null;
    } catch (err) {
      if (!isMissingColumnError(err)) throw err;
      try {
        const member = await prisma.member.findFirst({
          where: baseWhere,
          include: { ...KNOCKOUT_LEGACY, ...tournamentInclude, matchPredictions: true },
        });
        if (member) return { member, hasScorerColumns: true };
        return null;
      } catch (inner) {
        if (!isMissingColumnError(inner)) throw inner;
      }
    }
  }

  try {
    const member = await prisma.member.findFirst({
      where: baseWhere,
      include: {
        ...KNOCKOUT_FULL,
        ...tournamentInclude,
        matchPredictions: {
          select: { matchId: true, homeScore: true, awayScore: true },
        },
      },
    });
    if (member) return { member, hasScorerColumns: false };
  } catch (err) {
    if (!isMissingColumnError(err)) throw err;
    const member = await prisma.member.findFirst({
      where: baseWhere,
      include: {
        ...KNOCKOUT_LEGACY,
        ...tournamentInclude,
        matchPredictions: {
          select: { matchId: true, homeScore: true, awayScore: true },
        },
      },
    });
    if (member) return { member, hasScorerColumns: false };
  }

  return null;
}
