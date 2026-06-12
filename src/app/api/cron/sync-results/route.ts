import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncResultsNow } from "@/lib/sync-results-scheduler";

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await syncResultsNow();

  const resultsWithScore = await prisma.matchResult.count({
    where: { homeScore: { not: null }, awayScore: { not: null } },
  });

  return NextResponse.json({ ok: true, resultsWithScore });
}
