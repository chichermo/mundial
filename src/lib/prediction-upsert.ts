import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

/** Guarda marcador sin columnas de goleadores (BD antigua). */
export async function upsertBasicPrediction(
  memberId: string,
  matchId: number,
  homeScore: number,
  awayScore: number,
): Promise<void> {
  const existing = await prisma.matchPrediction.findFirst({
    where: { memberId, matchId },
    select: { id: true },
  });

  if (existing) {
    await prisma.$executeRawUnsafe(
      `UPDATE "MatchPrediction" SET "homeScore" = ?, "awayScore" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = ?`,
      homeScore,
      awayScore,
      existing.id,
    );
    return;
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO "MatchPrediction" ("id", "memberId", "matchId", "homeScore", "awayScore", "updatedAt") VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    randomUUID(),
    memberId,
    matchId,
    homeScore,
    awayScore,
  );
}
