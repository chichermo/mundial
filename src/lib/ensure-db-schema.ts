import { prisma } from "@/lib/prisma";

const INCREMENTAL_SQL = [
  `ALTER TABLE "MatchPrediction" ADD COLUMN "homeScorers" TEXT NOT NULL DEFAULT '[]'`,
  `ALTER TABLE "MatchPrediction" ADD COLUMN "awayScorers" TEXT NOT NULL DEFAULT '[]'`,
];

let schemaReady: Promise<void> | null = null;

/** Aplica ALTERs pendientes en Turso (idempotente). */
export function ensureDbSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = runMigrations();
  }
  return schemaReady;
}

async function runMigrations(): Promise<void> {
  for (const sql of INCREMENTAL_SQL) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("duplicate column") && !msg.includes("already exists")) {
        console.error("[ensure-db-schema]", msg);
      }
    }
  }
}
