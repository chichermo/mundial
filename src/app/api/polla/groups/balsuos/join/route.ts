import { NextResponse } from "next/server";
import { joinBalsuosGroup } from "@/lib/balsuos-group";
import { requireUser } from "@/lib/require-auth";

export async function POST() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Inicia sesión primero" }, { status: 401 });
  }

  const result = await joinBalsuosGroup(user.userId, user.displayName);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    code: result.session.groupCode,
    groupName: result.session.groupName,
  });
}
