import { NextResponse } from "next/server";
import { syncResultsIfStale } from "@/lib/sync-results-scheduler";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await syncResultsIfStale();

  const results = await prisma.matchResult.findMany();
  return NextResponse.json({
    results: results.map((r) => ({
      matchId: r.matchId,
      homeScore: r.homeScore,
      awayScore: r.awayScore,
      winnerLabel: r.winnerLabel,
    })),
  });
}
