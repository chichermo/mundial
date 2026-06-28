import { NextResponse } from "next/server";
import { z } from "zod";
import { isMissingColumnError } from "@/lib/db-errors";
import { ensureDbSchema, hasFullKnockoutSchema } from "@/lib/ensure-db-schema";
import { isMemberQualifiedForKnockout } from "@/lib/groups";
import { deriveKnockoutWinnerLabel } from "@/lib/knockout-predict";
import { resolveDisplayTeams } from "@/lib/knockout-rounds";
import { isPredictionLocked } from "@/lib/match-lock";
import { getMatch } from "@/lib/matches-data";
import { prisma } from "@/lib/prisma";
import { requirePollaMember } from "@/lib/require-auth";
import { dbErrorResponse } from "@/lib/api-error";

const schema = z.object({
  matchId: z.number().int().min(73).max(104),
  homeScore: z.number().int().min(0).max(15),
  awayScore: z.number().int().min(0).max(15),
  winnerLabel: z.string().min(1).max(80).optional(),
});

function advancerMatchesPick(
  pick: string,
  teams: { home: string; away: string },
  match: { home: string; away: string },
): boolean {
  const normalized = pick.trim();
  return (
    normalized === teams.home ||
    normalized === teams.away ||
    normalized === match.home ||
    normalized === match.away
  );
}

export async function POST(req: Request) {
  try {
    const auth = await requirePollaMember();
    if (!auth) {
      return NextResponse.json({ error: "Inicia sesión y elige un grupo" }, { status: 401 });
    }
    const session = auth.polla;

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Marcador inválido (0-15 por equipo)" }, { status: 400 });
    }

    const match = getMatch(parsed.data.matchId);
    if (!match) {
      return NextResponse.json({ error: "Partido no existe" }, { status: 404 });
    }

    await ensureDbSchema();
    const hasScoreColumns = await hasFullKnockoutSchema();

    const allResults = await prisma.matchResult.findMany();
    const resultMap = Object.fromEntries(allResults.map((r) => [r.matchId, r]));
    const result = resultMap[parsed.data.matchId];

    if (isPredictionLocked(match, result)) {
      return NextResponse.json(
        { error: "Partido cerrado: no se puede modificar el pronóstico" },
        { status: 403 },
      );
    }

    const canPick = await isMemberQualifiedForKnockout(session.memberId, session.groupId);
    if (!canPick) {
      return NextResponse.json(
        { error: "La eliminatoria se abre cuando termine la fase de grupos" },
        { status: 403 },
      );
    }

    const teams = resolveDisplayTeams(parsed.data.matchId, resultMap);
    const { homeScore, awayScore } = parsed.data;
    let winnerLabel = deriveKnockoutWinnerLabel(teams, homeScore, awayScore);

    if (!winnerLabel) {
      const pick = parsed.data.winnerLabel?.trim();
      if (!pick || !advancerMatchesPick(pick, teams, match)) {
        return NextResponse.json(
          { error: "Si pronosticas empate, indica quién clasifica." },
          { status: 400 },
        );
      }
      winnerLabel = pick;
    }

    const where = {
      memberId_matchId: {
        memberId: session.memberId,
        matchId: parsed.data.matchId,
      },
    };

    if (hasScoreColumns) {
      try {
        await prisma.knockoutPrediction.upsert({
          where,
          create: {
            memberId: session.memberId,
            matchId: parsed.data.matchId,
            winnerLabel,
            homeScore,
            awayScore,
          },
          update: { winnerLabel, homeScore, awayScore },
        });
      } catch (err) {
        if (!isMissingColumnError(err)) throw err;
        await prisma.knockoutPrediction.upsert({
          where,
          create: {
            memberId: session.memberId,
            matchId: parsed.data.matchId,
            winnerLabel,
          },
          update: { winnerLabel },
        });
      }
    } else {
      await prisma.knockoutPrediction.upsert({
        where,
        create: {
          memberId: session.memberId,
          matchId: parsed.data.matchId,
          winnerLabel,
        },
        update: { winnerLabel },
      });
    }

    return NextResponse.json({ ok: true, winnerLabel, homeScore, awayScore });
  } catch (err) {
    console.error("[knockout] POST error:", err);
    return dbErrorResponse(err);
  }
}
