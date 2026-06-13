import type { Match } from "@/lib/matches-data";
import { hasOfficialResult, type MatchResultLike } from "@/lib/match-lock";
import { getKickoffUtc } from "@/lib/timezones";

export type ResultLookup = Record<
  number,
  { homeScore: number | null; awayScore: number | null } | undefined
>;

export function getMatchResult(
  matchId: number,
  results: ResultLookup,
): MatchResultLike {
  return results[matchId] ?? null;
}

export function isMatchFinished(matchId: number, results: ResultLookup): boolean {
  return hasOfficialResult(getMatchResult(matchId, results));
}

/** Partidos sin resultado oficial (próximos, en vivo o cerrados sin marcador cargado). */
export function splitMatchesByOfficialResult(
  matchList: Match[],
  results: ResultLookup,
): { active: Match[]; history: Match[] } {
  const active: Match[] = [];
  const history: Match[] = [];

  for (const match of matchList) {
    if (isMatchFinished(match.id, results)) {
      history.push(match);
    } else {
      active.push(match);
    }
  }

  active.sort(compareMatchesByKickoff);
  history.sort((a, b) => compareMatchesByKickoff(b, a));

  return { active, history };
}

/** Primer partido aún sin resultado oficial (el más próximo o en curso). */
export function findCurrentMatch(
  matchList: Match[],
  results: ResultLookup,
): Match | undefined {
  return splitMatchesByOfficialResult(matchList, results).active[0];
}

export function compareMatchesByKickoff(a: Match, b: Match): number {
  const diff =
    getKickoffUtc(a.date, a.kickoffEst).getTime() - getKickoffUtc(b.date, b.kickoffEst).getTime();
  return diff !== 0 ? diff : a.id - b.id;
}

export function groupMatchesByDateSorted(matchList: Match[]): { date: string; matches: Match[] }[] {
  const sorted = [...matchList].sort(compareMatchesByKickoff);
  const groups: { date: string; matches: Match[] }[] = [];

  for (const match of sorted) {
    const last = groups[groups.length - 1];
    if (!last || last.date !== match.date) {
      groups.push({ date: match.date, matches: [match] });
    } else {
      last.matches.push(match);
    }
  }

  return groups;
}

export function formatMatchDayLabel(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}
