import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const matches = JSON.parse(
  readFileSync(join(__dirname, "../src/data/matches.json"), "utf8"),
).matches;

const TO_LOCAL = {
  turkey: "Turkiye",
  turkiye: "Turkiye",
  "czech republic": "Czechia",
  "bosnia & herzegovina": "Bosnia and Herzegovina",
  "bosnia and herzegovina": "Bosnia and Herzegovina",
  "united states": "USA",
  usa: "USA",
  mexico: "Mexico",
  curacao: "Curacao",
  "curaçao": "Curacao",
  "dr congo": "Congo DR",
  "congo dr": "Congo DR",
};

function norm(name) {
  const key = name.trim().toLowerCase();
  return TO_LOCAL[key] ?? name.trim();
}

function teamsMatch(t1, t2, lh, la) {
  const h = norm(t1);
  const a = norm(t2);
  const H = norm(lh);
  const A = norm(la);
  return (h === H && a === A) || (h === A && a === H);
}

function resolve(entry) {
  if (entry.num >= 73 && entry.num <= 102) return entry.num;
  const round = entry.round.toLowerCase();
  if (round.includes("third")) return 103;
  if (round === "final") return 104;
  const groupLetter = entry.group?.replace(/^Group\s+/i, "").trim();
  const candidates = matches.filter((m) => {
    if (m.date !== entry.date) return false;
    if (m.phase !== "group") return false;
    if (groupLetter && m.group !== groupLetter) return false;
    return teamsMatch(entry.team1, entry.team2, m.home, m.away);
  });
  return candidates.length ? candidates[0].id : undefined;
}

const url =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";
const data = await fetch(url).then((r) => r.json());
let mapped = 0;
const unmapped = [];
for (const entry of data.matches) {
  const id = resolve(entry);
  if (id) mapped++;
  else unmapped.push(`${entry.date} ${entry.team1} vs ${entry.team2} (${entry.group ?? entry.round})`);
}
console.log(`Mapped ${mapped}/${data.matches.length}`);
if (unmapped.length) {
  console.log("Unmapped:");
  unmapped.forEach((u) => console.log(" -", u));
}
