import { NextResponse } from "next/server";
import { mapEffectiveResults, purgePrematureResults } from "@/lib/match-result";
import { syncResultsIfStale } from "@/lib/sync-results-scheduler";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await syncResultsIfStale();
  await purgePrematureResults();

  const results = await prisma.matchResult.findMany();
  const effective = mapEffectiveResults(results);
  return NextResponse.json({
    results: results.map((r) => ({
      matchId: r.matchId,
      ...effective[r.matchId],
    })),
  });
}
