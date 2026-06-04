import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  matchId: z.number().int().min(1).max(104),
  homeScore: z.number().int().min(0).max(15).nullable(),
  awayScore: z.number().int().min(0).max(15).nullable(),
  winnerLabel: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { matchId, homeScore, awayScore, winnerLabel } = parsed.data;

  if (homeScore === null && awayScore === null && !winnerLabel) {
    await prisma.matchResult.deleteMany({ where: { matchId } });
    return NextResponse.json({ ok: true, cleared: true });
  }

  await prisma.matchResult.upsert({
    where: { matchId },
    create: { matchId, homeScore, awayScore, winnerLabel: winnerLabel ?? null },
    update: { homeScore, awayScore, winnerLabel: winnerLabel ?? null },
  });

  return NextResponse.json({ ok: true });
}
