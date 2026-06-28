import { createClient } from "@libsql/client";
import { prisma } from "@/lib/prisma";

const INCREMENTAL_SQL = [
  `ALTER TABLE "MatchPrediction" ADD COLUMN "homeScorers" TEXT NOT NULL DEFAULT '[]'`,
  `ALTER TABLE "MatchPrediction" ADD COLUMN "awayScorers" TEXT NOT NULL DEFAULT '[]'`,
  `ALTER TABLE "KnockoutPrediction" ADD COLUMN "homeScore" INTEGER`,
  `ALTER TABLE "KnockoutPrediction" ADD COLUMN "awayScore" INTEGER`,
];

let migrationPromise: Promise<void> | null = null;
let schemaReady = false;

async function tableColumnNames(table: string): Promise<Set<string>> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
      `PRAGMA table_info("${table}")`,
    );
    return new Set(rows.map((r) => r.name));
  } catch {
    return new Set();
  }
}

async function hasScorerColumns(): Promise<boolean> {
  const names = await tableColumnNames("MatchPrediction");
  return names.has("homeScorers") && names.has("awayScorers");
}

async function hasKnockoutScoreColumns(): Promise<boolean> {
  const names = await tableColumnNames("KnockoutPrediction");
  return names.has("homeScore") && names.has("awayScore");
}

async function isSchemaUpToDate(): Promise<boolean> {
  if (schemaReady) return true;
  const ok = (await hasScorerColumns()) && (await hasKnockoutScoreColumns());
  if (ok) schemaReady = true;
  return ok;
}

/** Aplica ALTERs pendientes. Devuelve true si las columnas de goleadores existen. */
export async function ensureDbSchema(): Promise<boolean> {
  if (await isSchemaUpToDate()) return true;

  if (!migrationPromise) {
    migrationPromise = runMigrations().finally(() => {
      migrationPromise = null;
    });
  }
  await migrationPromise;

  const ok = (await hasScorerColumns()) && (await hasKnockoutScoreColumns());
  if (ok) schemaReady = true;
  return hasScorerColumns();
}

export async function hasFullKnockoutSchema(): Promise<boolean> {
  await ensureDbSchema();
  return hasKnockoutScoreColumns();
}

async function runMigrations(): Promise<void> {
  const url = process.env.DATABASE_URL ?? "";

  if (url.startsWith("libsql:")) {
    const token = process.env.DATABASE_AUTH_TOKEN;
    if (!token) {
      console.error("[ensure-db-schema] Falta DATABASE_AUTH_TOKEN");
      return;
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
    return;
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
}
