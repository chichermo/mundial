import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export function isDbConfigError(err: unknown): boolean {
  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientRustPanicError
  ) {
    return true;
  }

  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("libsql") ||
    msg.includes("turso") ||
    msg.includes("URL_INVALID") ||
    msg.includes("SQLITE") ||
    msg.includes("no such table") ||
    msg.includes("no such column") ||
    msg.includes("Unable to open") ||
    msg.includes("Error code 14") ||
    msg.includes("Unauthorized") ||
    msg.includes("401") ||
    msg.includes("HRANA") ||
    msg.includes("fetch failed") ||
    msg.includes("Cannot find module") ||
    msg.includes("@libsql")
  );
}

export function dbErrorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "Error de base de datos";
  console.error("[db]", message);

  let hint = "En Vercel configura DATABASE_URL (libsql://...) y DATABASE_AUTH_TOKEN.";
  if (!process.env.DATABASE_URL?.startsWith("libsql:")) {
    hint =
      "DATABASE_URL en Vercel debe ser libsql://... (no file:./dev.db). Añade también DATABASE_AUTH_TOKEN.";
  } else if (!process.env.DATABASE_AUTH_TOKEN) {
    hint = "Falta DATABASE_AUTH_TOKEN en Vercel (token de Turso).";
  } else {
    hint =
      "Revisa DATABASE_URL y DATABASE_AUTH_TOKEN en Vercel. Schema: npm run db:push:turso";
  }

  return NextResponse.json(
    {
      error: "No se pudo conectar con la base de datos.",
      hint,
      ...(process.env.NODE_ENV === "development" ? { detail: message } : {}),
    },
    { status: 503 },
  );
}
