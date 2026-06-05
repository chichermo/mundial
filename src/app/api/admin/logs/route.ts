import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getAdminChangeLogs } from "@/lib/admin-log";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const logs = await getAdminChangeLogs(50);
  return NextResponse.json({ logs });
}
