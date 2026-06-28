/** Emoji bandera por nombre de selección (matches.json). */
const FLAGS: Record<string, string> = {
  Algeria: "🇩🇿",
  Argentina: "🇦🇷",
  Australia: "🇦🇺",
  Austria: "🇦🇹",
  Belgium: "🇧🇪",
  "Bosnia and Herzegovina": "🇧🇦",
  Brazil: "🇧🇷",
  Canada: "🇨🇦",
  "Cape Verde": "🇨🇻",
  Colombia: "🇨🇴",
  "Congo DR": "🇨🇩",
  Croatia: "🇭🇷",
  Ecuador: "🇪🇨",
  Egypt: "🇪🇬",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Ghana: "🇬🇭",
  "Ivory Coast": "🇨🇮",
  Japan: "🇯🇵",
  Jordan: "🇯🇴",
  Mexico: "🇲🇽",
  Morocco: "🇲🇦",
  Netherlands: "🇳🇱",
  Norway: "🇳🇴",
  Paraguay: "🇵🇾",
  Portugal: "🇵🇹",
  "South Africa": "🇿🇦",
  Senegal: "🇸🇳",
  Spain: "🇪🇸",
  Sweden: "🇸🇪",
  Switzerland: "🇨🇭",
  Tunisia: "🇹🇳",
  Turkey: "🇹🇷",
  Turkiye: "🇹🇷",
  USA: "🇺🇸",
  Uruguay: "🇺🇾",
};

export function teamFlag(team: string): string {
  return FLAGS[team] ?? "🏳️";
}

export function teamShortName(team: string): string {
  const map: Record<string, string> = {
    "Bosnia and Herzegovina": "BiH",
    "Ivory Coast": "Côte d'Ivoire",
    "South Africa": "Sudáfrica",
    "Congo DR": "Congo",
    "Cape Verde": "Cabo Verde",
  };
  return map[team] ?? team;
}
