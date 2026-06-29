import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDbSchema } from "@/lib/ensure-db-schema";
import { isMissingColumnError } from "@/lib/db-errors";
import { isPredictionLocked } from "@/lib/match-lock";
import { toEffectiveResult } from "@/lib/match-result";
import { getMatch } from "@/lib/matches-data";
import { upsertBasicPrediction } from "@/lib/prediction-upsert";
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
  const hasScorerColumns = await ensureDbSchema();

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const match = getMatch(parsed.data.matchId);
  if (!match) {
    return NextResponse.json({ error: "Partido no existe" }, { status: 404 });
  }

  const dbResult = await prisma.matchResult.findUnique({
    where: { matchId: parsed.data.matchId },
  });
  const result = dbResult ? toEffectiveResult(dbResult) : null;

  if (isPredictionLocked(match, result, parsed.data.matchId)) {
    return NextResponse.json(
      { error: "Este partido ya comenzó o terminó — no puedes cambiar el marcador" },
      { status: 403 },
    );
  }

  const scores = {
    homeScore: parsed.data.homeScore,
    awayScore: parsed.data.awayScore,
  };

  const where = {
    memberId_matchId: {
      memberId: session.memberId,
      matchId: parsed.data.matchId,
    },
  };

  if (!hasScorerColumns) {
    await upsertBasicPrediction(
      session.memberId,
      parsed.data.matchId,
      scores.homeScore,
      scores.awayScore,
    );
    return NextResponse.json({ ok: true });
  }

  const scorers = normalizeScorersForGoals(
    parsed.data.homeScorers ?? [],
    parsed.data.awayScorers ?? [],
    parsed.data.homeScore,
    parsed.data.awayScore,
  );

  const scorerFields = {
    homeScorers: scorersToJson(scorers.homeScorers),
    awayScorers: scorersToJson(scorers.awayScorers),
  };

  try {
    await prisma.matchPrediction.upsert({
      where,
      create: {
        memberId: session.memberId,
        matchId: parsed.data.matchId,
        ...scores,
        ...scorerFields,
      },
      update: { ...scores, ...scorerFields },
    });
  } catch (err) {
    if (!isMissingColumnError(err)) throw err;
    await upsertBasicPrediction(
      session.memberId,
      parsed.data.matchId,
      scores.homeScore,
      scores.awayScore,
    );
  }

  return NextResponse.json({ ok: true });
}
