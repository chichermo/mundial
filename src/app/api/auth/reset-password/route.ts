import { NextResponse } from "next/server";
import { z } from "zod";
import { dbErrorResponse, isDbConfigError } from "@/lib/api-error";
import { hashPassword } from "@/lib/auth";
import { BALSUOS_GROUP_CODE } from "@/lib/balsuos-group";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  identifier: z.string().min(2).max(120),
  groupCode: z.string().min(4).max(6),
  newPassword: z.string().min(6).max(72),
});

async function findUserByIdentifier(identifier: string) {
  const trimmed = identifier.trim();
  const email = trimmed.toLowerCase();

  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) return byEmail;

  const byDisplayName = await prisma.user.findFirst({
    where: { displayName: { equals: trimmed } },
  });
  if (byDisplayName) return byDisplayName;

  const member = await prisma.member.findFirst({
    where: {
      name: { equals: trimmed },
      userId: { not: null },
      group: { code: BALSUOS_GROUP_CODE },
    },
    include: { user: true },
  });

  return member?.user ?? null;
}

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Revisa email/nombre, código del grupo y contraseña (mín. 6 caracteres)." },
        { status: 400 },
      );
    }

    const { identifier, groupCode, newPassword } = parsed.data;
    const normalizedCode = groupCode.trim().toUpperCase();

    if (normalizedCode !== BALSUOS_GROUP_CODE) {
      return NextResponse.json({ error: "Código del grupo incorrecto." }, { status: 403 });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return NextResponse.json(
        { error: "No encontramos una cuenta con ese email o nombre en la polla." },
        { status: 404 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isDbConfigError(err)) return dbErrorResponse(err);
    console.error("[auth/reset-password]", err);
    return NextResponse.json({ error: "Error interno al cambiar la contraseña." }, { status: 500 });
  }
}
