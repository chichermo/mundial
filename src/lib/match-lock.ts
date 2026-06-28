import { getKickoffUtc } from "@/lib/timezones";

export type MatchResultLike = {
  homeScore: number | null;
  awayScore: number | null;
} | null | undefined;

export type MatchSchedule = {
  date: string;
  kickoffEst: string;
};

function kickoffMs(match: MatchSchedule): number {
  return getKickoffUtc(match.date, match.kickoffEst).getTime();
}

/** Partido cerrado: ya empezó o tiene resultado oficial. */
export function isPredictionLocked(
  match: MatchSchedule,
  result?: MatchResultLike,
): boolean {
  if (hasOfficialResult(result)) return true;
  return Date.now() >= kickoffMs(match);
}

export function hasOfficialResult(result?: MatchResultLike): boolean {
  return result?.homeScore != null && result?.awayScore != null;
}

export function lockReason(
  match: MatchSchedule,
  result?: MatchResultLike,
): string | null {
  if (hasOfficialResult(result)) return "Marcador cerrado (partido finalizado)";
  if (Date.now() >= kickoffMs(match)) {
    return "Marcador cerrado (el partido ya comenzó)";
  }
  return null;
}
