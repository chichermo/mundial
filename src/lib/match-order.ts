import type { Match } from "@/lib/matches-data";
import { getKickoffUtc } from "@/lib/timezones";

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
