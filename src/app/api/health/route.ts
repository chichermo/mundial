import { NextResponse } from "next/server";
import { isDbConfigError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  const hasToken = Boolean(process.env.DATABASE_AUTH_TOKEN);

  if (process.env.VERCEL && !url.startsWith("libsql:")) {
    return NextResponse.json(
      {
        ok: false,
        db: false,
        hint: "DATABASE_URL en Vercel debe ser libsql://...",
        env: { libsql: false, hasToken },
      },
      { status: 503 },
    );
  }

  if (url.startsWith("libsql:") && !hasToken) {
    return NextResponse.json(
      {
        ok: false,
        db: false,
        hint: "Falta DATABASE_AUTH_TOKEN",
        env: { libsql: true, hasToken: false },
      },
      { status: 503 },
    );
  }

  try {
    await prisma.user.count();
    return NextResponse.json({
      ok: true,
      db: true,
      env: { libsql: url.startsWith("libsql:"), hasToken },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        db: false,
        hint: isDbConfigError(err)
          ? "Error de conexión Turso — revisa credenciales"
          : "Error de base de datos",
        ...(process.env.NODE_ENV === "development" ? { detail: message } : {}),
      },
      { status: 503 },
    );
  }
}
