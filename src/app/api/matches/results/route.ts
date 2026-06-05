import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
