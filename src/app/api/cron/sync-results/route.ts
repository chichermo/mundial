import { NextResponse } from "next/server";
import { syncResultsFromApiFootball } from "@/lib/api-football-sync";
import { syncResultsFromOpenFootball } from "@/lib/openfootball-sync";

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const openfootball = await syncResultsFromOpenFootball();

  let apiFootball = null;
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (apiKey) {
    apiFootball = await syncResultsFromApiFootball(apiKey);
  }

  const ok = openfootball.ok || (apiFootball?.ok ?? false);
  return NextResponse.json(
    { openfootball, apiFootball },
    { status: ok ? 200 : 502 },
  );
}
