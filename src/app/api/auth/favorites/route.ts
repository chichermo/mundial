import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";

const schema = z.object({ teams: z.array(z.string().max(60)).max(20) });

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ teams: [] });
  const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
  try {
    const teams = dbUser?.favoriteTeams ? (JSON.parse(dbUser.favoriteTeams) as string[]) : [];
    return NextResponse.json({ teams });
  } catch {
    return NextResponse.json({ teams: [] });
  }
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  await prisma.user.update({
    where: { id: user.userId },
    data: { favoriteTeams: JSON.stringify(parsed.data.teams) },
  });
  return NextResponse.json({ ok: true });
}
