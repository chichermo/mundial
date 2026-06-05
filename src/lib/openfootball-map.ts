import { matches } from "@/lib/matches-data";
import type { OpenFootballMatch } from "@/lib/openfootball";
import { normalizeTeamName, teamsMatch } from "@/lib/team-aliases";

function isPlaceholderTeam(name: string): boolean {
  return /^[0-9WL]/.test(name.trim()) || name.includes("3rd") || name.includes("Winner") || name.includes("Loser");
}

/** Empareja entrada openfootball → matchId local (1–104). */
export function resolveOpenFootballMatchId(entry: OpenFootballMatch): number | undefined {
  if (entry.num != null && entry.num >= 73 && entry.num <= 102) {
    return entry.num;
  }

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

  if (candidates.length === 1) return candidates[0].id;
  if (candidates.length > 1) {
    return candidates.sort((a, b) => a.id - b.id)[0].id;
  }

  return undefined;
}

export function winnerLabelFromOpenFootball(
  matchId: number,
  entry: OpenFootballMatch,
  homeScore: number,
  awayScore: number,
): string | null {
  const match = matches.find((m) => m.id === matchId);
  if (!match || match.phase === "group") return null;

  if (homeScore === awayScore) {
    const pen = entry.score?.pen;
    if (pen && pen[0] !== pen[1]) {
      return pen[0] > pen[1]
        ? resolveWinnerName(match, entry.team1, entry.team2, entry.team1)
        : resolveWinnerName(match, entry.team1, entry.team2, entry.team2);
    }
    return null;
  }

  const winnerSide = homeScore > awayScore ? entry.team1 : entry.team2;
  return resolveWinnerName(match, entry.team1, entry.team2, winnerSide);
}

function resolveWinnerName(
  match: (typeof matches)[0],
  team1: string,
  team2: string,
  winnerSide: string,
): string | null {
  if (isPlaceholderTeam(winnerSide)) return null;

  const norm = normalizeTeamName(winnerSide);
  if (normalizeTeamName(match.home) === norm) return match.home;
  if (normalizeTeamName(match.away) === norm) return match.away;
  if (normalizeTeamName(team1) === norm) return match.home.startsWith("Match") ? team1 : match.home;
  if (normalizeTeamName(team2) === norm) return match.away.startsWith("Match") ? team2 : match.away;
  return norm;
}

/** Vista previa del mapeo sin guardar. */
export function previewOpenFootballMapping(entries: OpenFootballMatch[]) {
  let mapped = 0;
  const unmapped: OpenFootballMatch[] = [];

  for (const entry of entries) {
    if (resolveOpenFootballMatchId(entry)) mapped++;
    else unmapped.push(entry);
  }

  return { mapped, total: entries.length, unmapped: unmapped.slice(0, 10) };
}
