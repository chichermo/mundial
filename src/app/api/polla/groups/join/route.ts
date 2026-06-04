import { NextResponse } from "next/server";
import { z } from "zod";
import { joinGroupWithCode } from "@/lib/polla-groups";
import { requireUser } from "@/lib/require-auth";

const schema = z.object({
  code: z.string().length(6),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Inicia sesión primero" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Código debe tener 6 caracteres" }, { status: 400 });
  }

  const result = await joinGroupWithCode(
    user.userId,
    user.displayName,
    parsed.data.code.toUpperCase(),
  );

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ ok: true, code: result.session.groupCode });
}
