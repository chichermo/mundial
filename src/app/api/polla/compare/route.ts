import { NextResponse } from "next/server";
import { isMissingColumnError } from "@/lib/db-errors";
import { formatKnockoutPredictionDisplay } from "@/lib/knockout-predict";
import { isPredictionLocked } from "@/lib/match-lock";
import { getMatch } from "@/lib/matches-data";
import { prisma } from "@/lib/prisma";
import { requirePollaMember } from "@/lib/require-auth";
import { teamShortName } from "@/lib/team-flags";

function formatOfficialResult(
  homeScore: number,
  awayScore: number,
  winnerLabel?: string | null,
): string {
  let label = `${homeScore}-${awayScore}`;
  if (homeScore === awayScore && winnerLabel) {
    label += ` · ${teamShortName(winnerLabel)}`;
  }
  return label;
}

export async function GET(req: Request) {
  const auth = await requirePollaMember();
  if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const matchId = Number(new URL(req.url).searchParams.get("matchId"));
  const match = getMatch(matchId);
  if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

  const result = await prisma.matchResult.findUnique({ where: { matchId } });
  const locked = isPredictionLocked(match, result, matchId);
  const isKnockout = match.phase !== "group";

  const resultLabel =
    result?.homeScore != null && result?.awayScore != null
      ? formatOfficialResult(result.homeScore, result.awayScore, result.winnerLabel)
      : null;

  if (isKnockout) {
    let members;
    try {
      members = await prisma.member.findMany({
        where: { groupId: auth.polla.groupId },
        include: { knockoutPredictions: { where: { matchId } } },
        orderBy: { createdAt: "asc" },
      });
    } catch (err) {
      if (!isMissingColumnError(err)) throw err;
      members = await prisma.member.findMany({
        where: { groupId: auth.polla.groupId },
        include: {
          knockoutPredictions: {
            where: { matchId },
            select: { matchId: true, winnerLabel: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    }

    const predictions = members.map((m) => {
      const pred = m.knockoutPredictions[0];
      if (!pred) return { memberId: m.id, name: m.name, prediction: null };
      const display = formatKnockoutPredictionDisplay(pred);
      if (!display) return { memberId: m.id, name: m.name, prediction: null };
      return {
        memberId: m.id,
        name: m.name,
        prediction: locked ? display : "🔒 Oculto",
      };
    });

    return NextResponse.json({ matchId, locked, result: resultLabel, predictions });
  }

  const members = await prisma.member.findMany({
    where: { groupId: auth.polla.groupId },
    include: { matchPredictions: { where: { matchId } } },
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

  return NextResponse.json({ matchId, locked, result: resultLabel, predictions });
}
