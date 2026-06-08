import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMatch } from "@/lib/matches-data";
import { requirePollaMember } from "@/lib/require-auth";
import { isPredictionLocked } from "@/lib/match-lock";

export async function GET(req: Request) {
  const auth = await requirePollaMember();
  if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const matchId = Number(new URL(req.url).searchParams.get("matchId"));
  const match = getMatch(matchId);
  if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

  const result = await prisma.matchResult.findUnique({ where: { matchId } });
  const locked = isPredictionLocked(match, result);

  const members = await prisma.member.findMany({
    where: { groupId: auth.polla.groupId },
    include: {
      matchPredictions: { where: { matchId } },
    },
    orderBy: { createdAt: "asc" },
  });

  const predictions = members.map((m) => {
    const pred = m.matchPredictions[0];
    if (!pred) return { memberId: m.id, name: m.name, prediction: null };
    if (locked) {
      return {
        memberId: m.id,
        name: m.name,
        prediction: `${pred.homeScore}-${pred.awayScore}`,
      };
    }
    return { memberId: m.id, name: m.name, prediction: "🔒 Oculto" };
  });

  return NextResponse.json({
    matchId,
    locked,
    result:
      result?.homeScore != null && result.awayScore != null
        ? `${result.homeScore}-${result.awayScore}`
        : null,
    predictions,
  });
}
