import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { logAdminChange } from "@/lib/admin-log";
import { prisma } from "@/lib/prisma";

const rowSchema = z.object({
  matchId: z.number().int().min(1).max(104),
  homeScore: z.number().int().min(0).max(15).nullable(),
  awayScore: z.number().int().min(0).max(15).nullable(),
  winnerLabel: z.string().nullable().optional(),
});

const schema = z.object({ results: z.array(rowSchema).min(1).max(104) });

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  let saved = 0;
  for (const row of parsed.data.results) {
    if (row.homeScore === null && row.awayScore === null && !row.winnerLabel) {
      await prisma.matchResult.deleteMany({ where: { matchId: row.matchId } });
      continue;
    }
    await prisma.matchResult.upsert({
      where: { matchId: row.matchId },
      create: {
        matchId: row.matchId,
        homeScore: row.homeScore,
        awayScore: row.awayScore,
        winnerLabel: row.winnerLabel ?? null,
      },
      update: {
        homeScore: row.homeScore,
        awayScore: row.awayScore,
        winnerLabel: row.winnerLabel ?? null,
      },
    });
    saved++;
  }

  await logAdminChange("import_bulk", `${saved} resultados importados`);

  return NextResponse.json({ ok: true, saved });
}
