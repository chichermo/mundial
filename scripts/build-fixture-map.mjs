/**
 * Genera src/data/fixture-map.json emparejando API-Football con matches.json
 *
 * Uso: API_FOOTBALL_KEY=tu_clave node scripts/build-fixture-map.mjs
 */
import { writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadEnvKey() {
  if (process.env.API_FOOTBALL_KEY) return process.env.API_FOOTBALL_KEY;
  try {
    const envPath = join(__dirname, "../.env");
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^API_FOOTBALL_KEY=(?:"([^"]+)"|(\S+))/);
      if (m) return (m[1] ?? m[2]).trim();
    }
  } catch {
    /* sin .env */
  }
  return null;
}

const API_KEY = loadEnvKey();

if (!API_KEY) {
  console.error("Define API_FOOTBALL_KEY en .env o en la variable de entorno");
  process.exit(1);
}

const matchesPath = join(__dirname, "../src/data/matches.json");
const { matches } = JSON.parse(readFileSync(matchesPath, "utf8"));

const TO_LOCAL = {
  "united states": "USA",
  turkey: "Turkiye",
  "czech republic": "Czechia",
  "cote d'ivoire": "Ivory Coast",
  "côte d'ivoire": "Ivory Coast",
  "cabo verde": "Cape Verde",
  "dr congo": "Congo DR",
  "democratic republic of the congo": "Congo DR",
};

function norm(name) {
  const k = name.trim().toLowerCase();
  return TO_LOCAL[k] ?? name.trim();
}

function teamsMatch(ah, aa, lh, la) {
  const h = norm(ah);
  const a = norm(aa);
  const H = norm(lh);
  const A = norm(la);
  return (h === H && a === A) || (h === A && a === H);
}

function sameDay(iso, date) {
  return iso.slice(0, 10) === date;
}

function resolve(fixtures) {
  const entries = [];
  const used = new Set();

  for (const f of fixtures) {
    const { id, date } = f.fixture;
    const home = f.teams.home.name;
    const away = f.teams.away.name;

    let matchId;

    const group = matches.filter(
      (m) =>
        m.phase === "group" &&
        teamsMatch(home, away, m.home, m.away) &&
        sameDay(date, m.date),
    );
    if (group.length === 1) matchId = group[0].id;
    else if (group.length > 1) matchId = group[0].id;

    if (!matchId) {
      const ko = matches.filter((m) => m.phase !== "group" && sameDay(date, m.date));
      if (ko.length === 1) matchId = ko[0].id;
    }

    if (!matchId || used.has(matchId)) continue;
    used.add(matchId);
    entries.push({
      matchId,
      fixtureId: id,
      home: norm(home),
      away: norm(away),
    });
  }

  return entries.sort((a, b) => a.matchId - b.matchId);
}

const res = await fetch("https://v3.football.api-sports.io/fixtures?league=1&season=2026", {
  headers: { "x-apisports-key": API_KEY },
});

if (!res.ok) {
  console.error("API error", res.status, await res.text());
  process.exit(1);
}

const data = await res.json();
if (data.errors && Object.keys(data.errors).length) {
  console.error("API errors:", data.errors);
  if (data.errors.plan?.includes("2026")) {
    console.error(
      "\nEl plan Free de API-Football aún no incluye la temporada 2026.\n" +
        "Cuando abran el Mundial (o con plan de pago), vuelve a ejecutar: npm run fixture-map\n" +
        "Mientras tanto, carga resultados manualmente en /admin o usa import JSON.",
    );
  }
  process.exit(1);
}

const fixtures = data.response ?? [];
const entries = resolve(fixtures);

const out = {
  version: 1,
  generatedAt: new Date().toISOString(),
  entries,
};

const outPath = join(__dirname, "../src/data/fixture-map.json");
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`Mapeados ${entries.length}/${matches.length} partidos → ${outPath}`);

const mapped = new Set(entries.map((e) => e.matchId));
const missing = matches.filter((m) => !mapped.has(m.id)).map((m) => m.id);
if (missing.length) {
  console.log("Sin mapear (normal en eliminatoria con placeholders):", missing.slice(0, 15).join(", "), missing.length > 15 ? "…" : "");
}
