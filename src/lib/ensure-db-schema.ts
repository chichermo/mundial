import { createClient } from "@libsql/client";
import { prisma } from "@/lib/prisma";

const INCREMENTAL_SQL = [
  `ALTER TABLE "MatchPrediction" ADD COLUMN "homeScorers" TEXT NOT NULL DEFAULT '[]'`,
  `ALTER TABLE "MatchPrediction" ADD COLUMN "awayScorers" TEXT NOT NULL DEFAULT '[]'`,
  `ALTER TABLE "KnockoutPrediction" ADD COLUMN "homeScore" INTEGER`,
  `ALTER TABLE "KnockoutPrediction" ADD COLUMN "awayScore" INTEGER`,
];

let migrationPromise: Promise<boolean> | null = null;

/** Aplica ALTERs pendientes y devuelve true si las columnas de goleadores existen. */
export async function ensureDbSchema(): Promise<boolean> {
  if (await hasScorerColumns()) return true;

  if (!migrationPromise) {
    migrationPromise = runMigrations().finally(() => {
      migrationPromise = null;
    });
  }
  await migrationPromise;
  return hasScorerColumns();
}

async function hasScorerColumns(): Promise<boolean> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
      `PRAGMA table_info("MatchPrediction")`,
    );
    const names = new Set(rows.map((r) => r.name));
    return names.has("homeScorers") && names.has("awayScorers");
  } catch {
    return false;
  }
}

async function runMigrations(): Promise<boolean> {
  const url = process.env.DATABASE_URL ?? "";

  if (url.startsWith("libsql:")) {
    const token = process.env.DATABASE_AUTH_TOKEN;
    if (!token) {
      console.error("[ensure-db-schema] Falta DATABASE_AUTH_TOKEN");
      return false;
    }
    const client = createClient({ url, authToken: token });
    for (const sql of INCREMENTAL_SQL) {
      try {
        await client.execute(sql);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("duplicate column") && !msg.includes("already exists")) {
          console.error("[ensure-db-schema] libsql:", msg);
        }
      }
    }
  }

  for (const sql of INCREMENTAL_SQL) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("duplicate column") && !msg.includes("already exists")) {
        console.error("[ensure-db-schema] prisma:", msg);
      }
    }
  }

  return hasScorerColumns();
}
