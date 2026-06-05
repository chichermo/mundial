import { NextResponse } from "next/server";
import { computeLiveStandings } from "@/lib/groups";
import { requirePollaMember } from "@/lib/require-auth";

export async function GET() {
  const auth = await requirePollaMember();
  if (!auth) {
    return NextResponse.json({ error: "Inicia sesión y elige un grupo" }, { status: 401 });
  }

  const data = await computeLiveStandings(auth.polla.groupId);
  return NextResponse.json(data);
}
