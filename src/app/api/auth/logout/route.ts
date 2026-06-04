import { NextResponse } from "next/server";
import { clearAllSessions } from "@/lib/session";

export async function POST() {
  await clearAllSessions();
  return NextResponse.json({ ok: true });
}
