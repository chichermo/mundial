import type { Match } from "@/lib/matches-data";
import { hasOfficialResult, type MatchResultLike } from "@/lib/match-lock";
import { getKickoffUtc } from "@/lib/timezones";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";

/** Zona de referencia para agrupar jornadas (audiencia principal de la app). */
export const MATCH_CALENDAR_TZ = "America/Santiago";

export type ResultLookup = Record<
  number,
  { homeScore: number | null; awayScore: number | null } | undefined
>;

export function getTodayCalendarDay(tz = MATCH_CALENDAR_TZ): string {
  return formatInTimeZone(new Date(), tz, "yyyy-MM-dd");
}

/** Día calendario del pitido en la zona indicada (no la fecha FIFA en ET). */
export function getMatchCalendarDay(match: Pick<Match, "date" | "kickoffEst">, tz = MATCH_CALENDAR_TZ): string {
  const kickoff = getKickoffUtc(match.date, match.kickoffEst);
  return formatInTimeZone(kickoff, tz, "yyyy-MM-dd");
}

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

/** Próximo partido relevante: en vivo, luego el más cercano por venir. */
export function findCurrentMatch(
  matchList: Match[],
  results: ResultLookup,
): Match | undefined {
  const { active } = splitMatchesByOfficialResult(matchList, results);
  if (!active.length) return undefined;

  const now = Date.now();
  const live = active.find((m) => {
    const kick = getKickoffUtc(m.date, m.kickoffEst).getTime();
    return now >= kick && now < kick + 2 * 60 * 60 * 1000;
  });
  if (live) return live;

  const upcoming = active.filter((m) => getKickoffUtc(m.date, m.kickoffEst).getTime() > now);
  if (upcoming.length) return upcoming[0];

  return undefined;
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
    const day = getMatchCalendarDay(match);
    const last = groups[groups.length - 1];
    if (!last || last.date !== day) {
      groups.push({ date: day, matches: [match] });
    } else {
      last.matches.push(match);
    }
  }

  return groups;
}

export function formatMatchDayLabel(date: string, tz = MATCH_CALENDAR_TZ): string {
  const noon = new Date(`${date}T12:00:00Z`);
  return formatInTimeZone(noon, tz, "EEEE d MMM", { locale: es });
}
