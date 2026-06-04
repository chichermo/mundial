import { NextResponse } from "next/server";
import { z } from "zod";
import { createGroupForUser } from "@/lib/polla-groups";
import { requireUser } from "@/lib/require-auth";

const schema = z.object({
  groupName: z.string().min(3).max(40),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Inicia sesión primero" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Nombre de grupo inválido" }, { status: 400 });
  }

  const { group } = await createGroupForUser(
    user.userId,
    user.displayName,
    parsed.data.groupName.trim(),
  );

  return NextResponse.json({ ok: true, code: group.code, groupId: group.id });
}
