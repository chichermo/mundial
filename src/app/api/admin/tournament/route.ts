import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  champion: z.string().nullable().optional(),
  surprise: z.string().nullable().optional(),
  revelationTeam: z.string().nullable().optional(),
  topScorer: z.string().nullable().optional(),
  revelationPlayer: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const empty = (v?: string | null) => (v?.trim() ? v.trim() : null);

  await prisma.globalAnswers.upsert({
    where: { id: "global" },
    create: {
      id: "global",
      champion: empty(parsed.data.champion),
      surprise: empty(parsed.data.surprise),
      revelationTeam: empty(parsed.data.revelationTeam),
      topScorer: empty(parsed.data.topScorer),
      revelationPlayer: empty(parsed.data.revelationPlayer),
    },
    update: {
      champion: empty(parsed.data.champion),
      surprise: empty(parsed.data.surprise),
      revelationTeam: empty(parsed.data.revelationTeam),
      topScorer: empty(parsed.data.topScorer),
      revelationPlayer: empty(parsed.data.revelationPlayer),
    },
  });

  return NextResponse.json({ ok: true });
}
