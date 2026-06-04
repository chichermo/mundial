import { NextResponse } from "next/server";
import { setAdminSession, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password?: string };
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD no configurada en el servidor" },
      { status: 503 },
    );
  }
  if (!(await verifyAdminPassword(password ?? ""))) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }
  await setAdminSession(password!);
  return NextResponse.json({ ok: true });
}
