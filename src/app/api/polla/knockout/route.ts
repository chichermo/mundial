import { NextResponse } from "next/server";
import { z } from "zod";
import { isMemberQualifiedForKnockout } from "@/lib/groups";
import { prisma } from "@/lib/prisma";
import { requirePollaMember } from "@/lib/require-auth";

const schema = z.object({
  matchId: z.number().int().min(73).max(104),
  winnerLabel: z.string().min(1).max(80),
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

  const qualified = await isMemberQualifiedForKnockout(session.memberId, session.groupId);
  if (!qualified) {
    return NextResponse.json(
      { error: "Solo los 4 clasificados pueden pronosticar la eliminatoria" },
      { status: 403 },
    );
  }

  await prisma.knockoutPrediction.upsert({
    where: {
      memberId_matchId: {
        memberId: session.memberId,
        matchId: parsed.data.matchId,
      },
    },
    create: {
      memberId: session.memberId,
      matchId: parsed.data.matchId,
      winnerLabel: parsed.data.winnerLabel,
    },
    update: { winnerLabel: parsed.data.winnerLabel },
  });

  return NextResponse.json({ ok: true });
}
