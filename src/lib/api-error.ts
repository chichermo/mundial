import { NextResponse } from "next/server";

export function isDbConfigError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("libsql") ||
    msg.includes("URL_INVALID") ||
    msg.includes("SQLITE") ||
    msg.includes("no such table") ||
    msg.includes("no such column") ||
    msg.includes("Unable to open") ||
    msg.includes("Error code 14")
  );
}

export function dbErrorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "Error de base de datos";
  console.error("[db]", message);

  const hint = process.env.DATABASE_URL?.startsWith("libsql:")
    ? "Revisa DATABASE_URL y DATABASE_AUTH_TOKEN en Vercel y ejecuta npx prisma db push contra Turso."
    : "En Vercel configura Turso (libsql://...) o ejecuta npx prisma db push en local.";

  return NextResponse.json(
    {
      error: "No se pudo conectar con la base de datos.",
      hint: process.env.NODE_ENV === "development" ? `${hint} (${message})` : hint,
    },
    { status: 503 },
  );
}
