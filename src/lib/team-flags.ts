/** ISO 3166-1 alpha-2 para banderas (flagcdn.com). */
const ISO: Record<string, string> = {
  Algeria: "dz",
  Argentina: "ar",
  Australia: "au",
  Austria: "at",
  Belgium: "be",
  "Bosnia and Herzegovina": "ba",
  Brazil: "br",
  Canada: "ca",
  "Cape Verde": "cv",
  Colombia: "co",
  "Congo DR": "cd",
  Croatia: "hr",
  Ecuador: "ec",
  Egypt: "eg",
  England: "gb",
  France: "fr",
  Germany: "de",
  Ghana: "gh",
  "Ivory Coast": "ci",
  Japan: "jp",
  Jordan: "jo",
  Mexico: "mx",
  Morocco: "ma",
  Netherlands: "nl",
  Norway: "no",
  Paraguay: "py",
  Portugal: "pt",
  "South Africa": "za",
  Senegal: "sn",
  Spain: "es",
  Sweden: "se",
  Switzerland: "ch",
  Tunisia: "tn",
  Turkey: "tr",
  Turkiye: "tr",
  USA: "us",
  Uruguay: "uy",
};

/** Emoji fallback cuando no hay ISO (placeholders del cuadro). */
const EMOJI: Record<string, string> = {
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
  USA: "🇺🇸",
  Uruguay: "🇺🇾",
};

export function teamFlagIso(team: string): string | null {
  const trimmed = team.trim();
  if (ISO[trimmed]) return ISO[trimmed]!;
  return null;
}

export function teamFlagUrl(team: string, size: 40 | 80 | 160 = 80): string | null {
  const iso = teamFlagIso(team);
  if (!iso) return null;
  return `https://flagcdn.com/w${size}/${iso}.png`;
}

export function teamFlag(team: string): string {
  return EMOJI[team.trim()] ?? "🏳️";
}

export function teamShortName(team: string): string {
  const map: Record<string, string> = {
    "Bosnia and Herzegovina": "BiH",
    "Ivory Coast": "Côte d'Ivoire",
    "South Africa": "Sudáfrica",
    "Congo DR": "Congo",
    "Cape Verde": "Cabo Verde",
  };
  return map[team.trim()] ?? team;
}
