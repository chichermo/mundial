/**
 * Aplica el schema de Prisma a Turso (libsql://).
 *
 * Opción A — variables en .env (recomendado):
 *   TURSO_DATABASE_URL="libsql://tu-db.turso.io"
 *   TURSO_AUTH_TOKEN="tu-token"
 *   npm run db:push:turso
 *
 * Opción B — PowerShell (token entre comillas simples '...'):
 *   $env:TURSO_DATABASE_URL = 'libsql://tu-db.turso.io'
 *   $env:TURSO_AUTH_TOKEN = 'eyJ...'
 *   npm run db:push:turso
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@libsql/client";

function loadEnvFile() {
  if (!existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = val;
  }
}

loadEnvFile();

const url = (
  process.env.TURSO_DATABASE_URL ??
  (process.env.DATABASE_URL?.startsWith("libsql:") ? process.env.DATABASE_URL : "")
)?.replace(/^["']|["']$/g, "");

const authToken = (
  process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN
)?.replace(/^["']|["']$/g, "");

if (!url?.startsWith("libsql:")) {
  console.error("❌ Falta TURSO_DATABASE_URL (libsql://...) en .env o en el entorno");
  process.exit(1);
}
if (!authToken) {
  console.error("❌ Falta TURSO_AUTH_TOKEN en .env o en el entorno");
  process.exit(1);
}

console.log("→ Generando SQL del schema…");
const sql = execSync(
  "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
  { encoding: "utf8", stdio: ["pipe", "pipe", "inherit"] },
);

function splitStatements(script) {
  const lines = script.split("\n");
  const chunks = [];
  let current = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("--")) continue;
    current += `${line}\n`;
    if (trimmed.endsWith(";")) {
      const stmt = current.trim();
      if (stmt) chunks.push(stmt.replace(/;\s*$/, ""));
      current = "";
    }
  }

  return chunks;
}

const statements = splitStatements(sql);
console.log(`→ Conectando a Turso (${url.replace(/\/\/.*@/, "//***@")})…`);

const client = createClient({ url, authToken });

async function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} (timeout ${ms / 1000}s)`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

try {
  await withTimeout(client.execute("SELECT 1"), 20_000, "Sin respuesta de Turso");
  console.log("→ Conexión OK");
} catch (err) {
  console.error("❌ No se pudo conectar a Turso:", err instanceof Error ? err.message : err);
  console.error("   Revisa URL, token y conexión a internet.");
  process.exit(1);
}

const INCREMENTAL = [
  `ALTER TABLE "MatchPrediction" ADD COLUMN "homeScorers" TEXT NOT NULL DEFAULT '[]'`,
  `ALTER TABLE "MatchPrediction" ADD COLUMN "awayScorers" TEXT NOT NULL DEFAULT '[]'`,
];

console.log("→ Migraciones incrementales…");
for (const stmt of INCREMENTAL) {
  try {
    await client.execute(stmt);
    console.log("   +", stmt.slice(0, 60), "…");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("duplicate column")) {
      console.log("   · columna ya existe");
    } else {
      console.log("   ·", msg.slice(0, 80));
    }
  }
}

console.log(`→ Aplicando ${statements.length} sentencias…`);

let applied = 0;
let skipped = 0;

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  process.stdout.write(`   [${i + 1}/${statements.length}] `);
  try {
    await withTimeout(client.execute(stmt), 30_000, `Sentencia ${i + 1} colgada`);
    applied++;
    console.log("ok");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("already exists") || msg.includes("duplicate column")) {
      skipped++;
      console.log("ya existía");
      continue;
    }
    console.error("\n❌ Error:", msg);
    console.error("   SQL:", stmt.slice(0, 120), "…");
    process.exit(1);
  }
}

console.log(`\n✔ Turso listo: ${applied} aplicadas, ${skipped} ya existían.`);
