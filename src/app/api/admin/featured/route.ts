import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { setFeaturedMatch } from "@/lib/app-config";
import { logAdminChange } from "@/lib/admin-log";

const schema = z.object({
  matchId: z.number().int().min(1).max(104).nullable(),
  multiplier: z.number().int().min(2).max(5).optional(),
});

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  await setFeaturedMatch(parsed.data.matchId, parsed.data.multiplier ?? 2);
  await logAdminChange(
    "featured_match",
    parsed.data.matchId ? `#${parsed.data.matchId} x${parsed.data.multiplier ?? 2}` : "sin partido",
  );
  return NextResponse.json({ ok: true });
}
