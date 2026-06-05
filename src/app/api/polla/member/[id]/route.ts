import { NextResponse } from "next/server";
import { computeAchievements } from "@/lib/achievements";
import { computeLiveStandings } from "@/lib/groups";
import { prisma } from "@/lib/prisma";
import { getMatchPoints } from "@/lib/scoring";
import { requirePollaMember } from "@/lib/require-auth";
import { matches } from "@/lib/matches-data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requirePollaMember();
  if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const member = await prisma.member.findFirst({
    where: { id, groupId: auth.polla.groupId },
    include: { matchPredictions: true },
  });
  if (!member) return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });

  const results = await prisma.matchResult.findMany();
  const resultMap = new Map(
    results
      .filter((r) => r.homeScore != null && r.awayScore != null)
      .map((r) => [r.matchId, { homeScore: r.homeScore!, awayScore: r.awayScore! }]),
  );

  const history = member.matchPredictions
    .map((pred) => {
      const result = resultMap.get(pred.matchId);
      const m = matches.find((x) => x.id === pred.matchId);
      if (!result || !m) return null;
      return {
        matchId: pred.matchId,
        label: `${m.home} vs ${m.away}`,
        prediction: `${pred.homeScore}-${pred.awayScore}`,
        result: `${result.homeScore}-${result.awayScore}`,
        points: getMatchPoints(pred, result),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.matchId - a!.matchId);

  const standings = await computeLiveStandings(auth.polla.groupId);
  const row = standings.rows.find((r) => r.id === id);

  const achievements = computeAchievements({
    name: member.name,
    predictions: member.matchPredictions,
    results: resultMap,
  });

  return NextResponse.json({
    id: member.id,
    name: member.name,
    rank: row?.rank ?? 0,
    groupPts: row?.groupPts ?? 0,
    total: row?.total ?? 0,
    qualified: row?.qualified ?? false,
    provisionalQualified: row?.provisionalQualified ?? false,
    history,
    achievements,
  });
}
