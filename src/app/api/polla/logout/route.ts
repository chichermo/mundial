import { NextResponse } from "next/server";
import { clearPollaSession } from "@/lib/session";

/** Cierra solo el grupo activo (mantiene la cuenta) */
export async function POST() {
  await clearPollaSession();
  return NextResponse.json({ ok: true });
}
