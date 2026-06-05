import { NextResponse } from "next/server";
import { syncResultsFromApiFootball } from "@/lib/api-football-sync";
import { isAdmin } from "@/lib/admin-auth";
import { getFixtureMapMeta } from "@/lib/fixture-map";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  return NextResponse.json({
    configured: Boolean(apiKey),
    fixtureMap: getFixtureMapMeta(),
  });
}

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Falta API_FOOTBALL_KEY en variables de entorno" },
      { status: 503 },
    );
  }

  const result = await syncResultsFromApiFootball(apiKey);
  const status = result.ok ? 200 : 502;
  return NextResponse.json(result, { status });
}
