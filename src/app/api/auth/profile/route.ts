import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserSession, setUserSession } from "@/lib/session";

const profileSchema = z.object({
  displayName: z.string().min(2).max(32).optional(),
  notifyMatchReminders: z.boolean().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(72),
});

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      displayName: true,
      notifyMatchReminders: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const parsed = profileSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const data = parsed.data;
  const user = await prisma.user.update({
    where: { id: session.userId },
    data: {
      ...(data.displayName !== undefined && { displayName: data.displayName.trim() }),
      ...(data.notifyMatchReminders !== undefined && {
        notifyMatchReminders: data.notifyMatchReminders,
      }),
    },
  });

  if (data.displayName) {
    await prisma.member.updateMany({
      where: { userId: user.id },
      data: { name: user.displayName },
    });
  }

  await setUserSession({
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
  });

  return NextResponse.json({
    ok: true,
    user: {
      displayName: user.displayName,
      notifyMatchReminders: user.notifyMatchReminders,
    },
  });
}

export async function PUT(req: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const parsed = passwordSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Contraseña nueva mínimo 6 caracteres" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  return NextResponse.json({ ok: true });
}
