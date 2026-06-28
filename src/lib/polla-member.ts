import type { KnockoutPrediction, Member, TournamentPick } from "@prisma/client";
import { isMissingColumnError } from "@/lib/db-errors";
import { ensureDbSchema, hasFullKnockoutSchema } from "@/lib/ensure-db-schema";
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

const baseWhere = (memberId: string, userId: string) => ({ id: memberId, userId });

export async function loadPollaMember(
  memberId: string,
  userId: string,
): Promise<PollaMemberData | null> {
  await ensureDbSchema();
  const where = baseWhere(memberId, userId);
  const hasScorerColumns = await ensureDbSchema();
  const hasKnockoutScores = await hasFullKnockoutSchema();

  const queries: Array<{
    hasScorerColumns: boolean;
    run: () => ReturnType<typeof prisma.member.findFirst>;
  }> = [];

  if (hasScorerColumns && hasKnockoutScores) {
    queries.push({
      hasScorerColumns: true,
      run: () =>
        prisma.member.findFirst({
          where,
          include: {
            matchPredictions: true,
            knockoutPredictions: true,
            tournamentPick: true,
          },
        }),
    });
  }

  if (hasScorerColumns) {
    queries.push({
      hasScorerColumns: true,
      run: () =>
        prisma.member.findFirst({
          where,
          include: {
            matchPredictions: true,
            knockoutPredictions: { select: { matchId: true, winnerLabel: true } },
            tournamentPick: true,
          },
        }),
    });
  }

  queries.push({
    hasScorerColumns: false,
    run: () =>
      prisma.member.findFirst({
        where,
        include: {
          matchPredictions: {
            select: { matchId: true, homeScore: true, awayScore: true },
          },
          knockoutPredictions: { select: { matchId: true, winnerLabel: true } },
          tournamentPick: true,
        },
      }),
  });

  let lastError: unknown;
  for (const q of queries) {
    try {
      const member = await q.run();
      if (member) {
        return {
          member: member as PollaMemberData["member"],
          hasScorerColumns: q.hasScorerColumns,
        };
      }
    } catch (err) {
      lastError = err;
      if (!isMissingColumnError(err)) break;
    }
  }

  if (lastError && !isMissingColumnError(lastError)) throw lastError;
  return null;
}
