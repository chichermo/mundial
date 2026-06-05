import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePollaMember } from "@/lib/require-auth";

const postSchema = z.object({
  matchId: z.number().int().min(1).max(104),
  text: z.string().min(1).max(280),
});

export async function GET(req: Request) {
  const auth = await requirePollaMember();
  if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const url = new URL(req.url);
  const matchId = Number(url.searchParams.get("matchId"));
  if (!matchId) return NextResponse.json({ error: "matchId requerido" }, { status: 400 });

  const comments = await prisma.matchComment.findMany({
    where: { groupId: auth.polla.groupId, matchId },
    include: { member: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return NextResponse.json({
    comments: comments.map((c) => ({
      id: c.id,
      text: c.text,
      author: c.member.name,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const auth = await requirePollaMember();
  if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const comment = await prisma.matchComment.create({
    data: {
      matchId: parsed.data.matchId,
      text: parsed.data.text.trim(),
      groupId: auth.polla.groupId,
      memberId: auth.polla.memberId,
    },
    include: { member: { select: { name: true } } },
  });

  return NextResponse.json({
    comment: {
      id: comment.id,
      text: comment.text,
      author: comment.member.name,
      createdAt: comment.createdAt.toISOString(),
    },
  });
}
