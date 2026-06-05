import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { fetchOpenFootballData } from "@/lib/openfootball";
import { previewOpenFootballMapping } from "@/lib/openfootball-map";
import { syncResultsFromOpenFootball } from "@/lib/openfootball-sync";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const data = await fetchOpenFootballData();
    const preview = previewOpenFootballMapping(data.matches);
    const withScores = data.matches.filter((m) => m.score?.ft?.length === 2).length;

    return NextResponse.json({
      source: "openfootball",
      url: process.env.OPENFOOTBALL_URL ?? "default GitHub raw",
      totalMatches: data.matches.length,
      withScores,
      mapping: preview,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 502 },
    );
  }
}

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await syncResultsFromOpenFootball();
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
