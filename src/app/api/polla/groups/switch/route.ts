import { NextResponse } from "next/server";
import { z } from "zod";
import { switchToMember } from "@/lib/polla-groups";
import { requireUser } from "@/lib/require-auth";

const schema = z.object({
  memberId: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Inicia sesión primero" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const session = await switchToMember(user.userId, parsed.data.memberId);
  if (!session) {
    return NextResponse.json({ error: "No perteneces a ese grupo" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
