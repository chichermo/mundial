import { NextResponse } from "next/server";
import { z } from "zod";
import { dbErrorResponse, isDbConfigError } from "@/lib/api-error";
import { verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setUserSession } from "@/lib/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Email o contraseña inválidos." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase().trim() },
    });

    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "Email o contraseña incorrectos." }, { status: 401 });
    }

    await setUserSession({
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isDbConfigError(err)) return dbErrorResponse(err);
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Error interno al iniciar sesión." }, { status: 500 });
  }
}
