import { NextResponse } from "next/server";
import { computeLiveStandings } from "@/lib/groups";
import { requirePollaMember } from "@/lib/require-auth";

export async function GET() {
  const auth = await requirePollaMember();
  if (!auth) {
    return NextResponse.json({ error: "Inicia sesión y elige un grupo" }, { status: 401 });
  }

  try {
    const data = await computeLiveStandings(auth.polla.groupId);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[leaderboard]", err);
    return NextResponse.json({ error: "No se pudo cargar el ranking" }, { status: 503 });
  }
}
