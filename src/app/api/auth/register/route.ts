import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setUserSession } from "@/lib/session";

const schema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(6).max(72),
  displayName: z.string().min(2).max(32),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa email, contraseña (mín. 6) y nombre." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      displayName: parsed.data.displayName.trim(),
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  await setUserSession({
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
  });

  return NextResponse.json({ ok: true });
}
