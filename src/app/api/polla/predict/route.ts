import { NextResponse } from "next/server";
import { z } from "zod";
import { isPredictionLocked } from "@/lib/match-lock";
import { getMatch } from "@/lib/matches-data";
import { prisma } from "@/lib/prisma";
import { requirePollaMember } from "@/lib/require-auth";
import { normalizeScorersForGoals, scorersToJson } from "@/lib/scorers";

const schema = z.object({
  matchId: z.number().int().min(1).max(104),
  homeScore: z.number().int().min(0).max(15),
  awayScore: z.number().int().min(0).max(15),
  homeScorers: z.array(z.string().max(80)).max(15).optional(),
  awayScorers: z.array(z.string().max(80)).max(15).optional(),
});

export async function POST(req: Request) {
  const auth = await requirePollaMember();
  if (!auth) {
    return NextResponse.json({ error: "Inicia sesión y elige un grupo" }, { status: 401 });
  }
  const session = auth.polla;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const match = getMatch(parsed.data.matchId);
  if (!match) {
    return NextResponse.json({ error: "Partido no existe" }, { status: 404 });
  }

  const result = await prisma.matchResult.findUnique({
    where: { matchId: parsed.data.matchId },
  });

  if (isPredictionLocked(match, result)) {
    return NextResponse.json(
      { error: "Partido cerrado: no se puede modificar el pronóstico" },
      { status: 403 },
    );
  }

  const scorers = normalizeScorersForGoals(
    parsed.data.homeScorers ?? [],
    parsed.data.awayScorers ?? [],
    parsed.data.homeScore,
    parsed.data.awayScore,
  );

  await prisma.matchPrediction.upsert({
    where: {
      memberId_matchId: {
        memberId: session.memberId,
        matchId: parsed.data.matchId,
      },
    },
    create: {
      memberId: session.memberId,
      matchId: parsed.data.matchId,
      homeScore: parsed.data.homeScore,
      awayScore: parsed.data.awayScore,
      homeScorers: scorersToJson(scorers.homeScorers),
      awayScorers: scorersToJson(scorers.awayScorers),
    },
    update: {
      homeScore: parsed.data.homeScore,
      awayScore: parsed.data.awayScore,
      homeScorers: scorersToJson(scorers.homeScorers),
      awayScorers: scorersToJson(scorers.awayScorers),
    },
  });

  return NextResponse.json({ ok: true });
}
