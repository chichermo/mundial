import { NextResponse } from "next/server";
import { syncResultsFromApiFootball } from "@/lib/api-football-sync";

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API_FOOTBALL_KEY no configurado" }, { status: 503 });
  }

  const result = await syncResultsFromApiFootball(apiKey);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
