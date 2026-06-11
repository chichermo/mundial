import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePollaMember } from "@/lib/require-auth";

const schema = z.object({
  champion: z.string().optional(),
  surprise: z.string().optional(),
  revelationTeam: z.string().optional(),
  topScorer: z.string().optional(),
  revelationPlayer: z.string().optional(),
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

  const emptyToNull = (v?: string) => (v?.trim() ? v.trim() : null);

  await prisma.tournamentPick.upsert({
    where: { memberId: session.memberId },
    create: {
      memberId: session.memberId,
      champion: emptyToNull(parsed.data.champion),
      surprise: emptyToNull(parsed.data.surprise),
      revelationTeam: emptyToNull(parsed.data.revelationTeam),
      topScorer: emptyToNull(parsed.data.topScorer),
      revelationPlayer: emptyToNull(parsed.data.revelationPlayer),
    },
    update: {
      champion: emptyToNull(parsed.data.champion),
      surprise: emptyToNull(parsed.data.surprise),
      revelationTeam: emptyToNull(parsed.data.revelationTeam),
      topScorer: emptyToNull(parsed.data.topScorer),
      revelationPlayer: emptyToNull(parsed.data.revelationPlayer),
    },
  });

  return NextResponse.json({ ok: true });
}
