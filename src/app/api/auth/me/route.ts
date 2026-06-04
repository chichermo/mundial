import { NextResponse } from "next/server";
import { getPollaSession, getUserSession } from "@/lib/session";

export async function GET() {
  const user = await getUserSession();
  if (!user) return NextResponse.json({ user: null });
  const polla = await getPollaSession();
  return NextResponse.json({ user, polla });
}
