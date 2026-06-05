/** Normaliza nombres API-Football → nombres en matches.json */
const TO_LOCAL: Record<string, string> = {
  "united states": "USA",
  usa: "USA",
  turkey: "Turkiye",
  turkiye: "Turkiye",
  "czech republic": "Czechia",
  czechia: "Czechia",
  "cote d'ivoire": "Ivory Coast",
  "côte d'ivoire": "Ivory Coast",
  "ivory coast": "Ivory Coast",
  "cabo verde": "Cape Verde",
  "cape verde": "Cape Verde",
  "dr congo": "Congo DR",
  "congo dr": "Congo DR",
  "democratic republic of the congo": "Congo DR",
  "congo democratic republic": "Congo DR",
  "bosnia-herzegovina": "Bosnia and Herzegovina",
  "bosnia and herzegovina": "Bosnia and Herzegovina",
  "bosnia & herzegovina": "Bosnia and Herzegovina",
  mexico: "Mexico",
  "south africa": "South Africa",
  "south korea": "South Korea",
  "korea republic": "South Korea",
  canada: "Canada",
  brazil: "Brazil",
  argentina: "Argentina",
  spain: "Spain",
  belgium: "Belgium",
  france: "France",
  germany: "Germany",
  england: "England",
  portugal: "Portugal",
  netherlands: "Netherlands",
  japan: "Japan",
  morocco: "Morocco",
  switzerland: "Switzerland",
  uruguay: "Uruguay",
  ecuador: "Ecuador",
  senegal: "Senegal",
  egypt: "Egypt",
  iran: "Iran",
  "saudi arabia": "Saudi Arabia",
  australia: "Australia",
  "new zealand": "New Zealand",
  qatar: "Qatar",
  haiti: "Haiti",
  scotland: "Scotland",
  paraguay: "Paraguay",
  tunisia: "Tunisia",
  sweden: "Sweden",
  norway: "Norway",
  austria: "Austria",
  jordan: "Jordan",
  algeria: "Algeria",
  iraq: "Iraq",
  ghana: "Ghana",
  panama: "Panama",
  croatia: "Croatia",
  colombia: "Colombia",
  uzbekistan: "Uzbekistan",
  curacao: "Curacao",
  "curaçao": "Curacao",
};

export function normalizeTeamName(name: string): string {
  const key = name.trim().toLowerCase();
  return TO_LOCAL[key] ?? name.trim();
}

export function teamsMatch(apiHome: string, apiAway: string, localHome: string, localAway: string): boolean {
  const h = normalizeTeamName(apiHome);
  const a = normalizeTeamName(apiAway);
  const lh = normalizeTeamName(localHome);
  const la = normalizeTeamName(localAway);
  return (h === lh && a === la) || (h === la && a === lh);
}
