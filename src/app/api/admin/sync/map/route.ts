import { NextResponse } from "next/server";
import { fetchWorldCupFixtures } from "@/lib/api-football";
import { buildFixtureMapEntries, getFixtureMapMeta } from "@/lib/fixture-map";
import { isAdmin } from "@/lib/admin-auth";
import { matches } from "@/lib/matches-data";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Falta API_FOOTBALL_KEY" }, { status: 503 });
  }

  try {
    const fixtures = await fetchWorldCupFixtures(apiKey);
    const entries = buildFixtureMapEntries(fixtures);
    const mappedIds = new Set(entries.map((e) => e.matchId));
    const unmappedLocal = matches.filter((m) => !mappedIds.has(m.id)).map((m) => m.id);

    return NextResponse.json({
      fixtureMap: getFixtureMapMeta(),
      preview: {
        mapped: entries.length,
        totalLocal: matches.length,
        totalApi: fixtures.length,
        unmappedLocal: unmappedLocal.slice(0, 30),
        entries: entries.slice(0, 20),
      },
      hint: "Ejecuta npm run fixture-map localmente para guardar fixture-map.json en el repo",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 502 },
    );
  }
}
