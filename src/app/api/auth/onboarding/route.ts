import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";

export async function POST() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  await prisma.user.update({
    where: { id: user.userId },
    data: { onboardingDone: true },
  });
  return NextResponse.json({ ok: true });
}
