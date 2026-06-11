import { getKickoffUtc } from "@/lib/timezones";

export type MatchResultLike = {
  homeScore: number | null;
  awayScore: number | null;
} | null | undefined;

export type MatchSchedule = {
  date: string;
  kickoffEst: string;
};

/** Partido cerrado: ya empezó o ya tiene resultado oficial cargado. */
export function isPredictionLocked(
  match: MatchSchedule,
  result?: MatchResultLike,
): boolean {
  if (hasOfficialResult(result)) return true;
  return Date.now() >= getKickoffUtc(match.date, match.kickoffEst).getTime();
}

export function hasOfficialResult(result?: MatchResultLike): boolean {
  return result?.homeScore != null && result?.awayScore != null;
}

export function lockReason(
  match: MatchSchedule,
  result?: MatchResultLike,
): string | null {
  if (hasOfficialResult(result)) return "Marcador cerrado (partido finalizado)";
  if (Date.now() >= getKickoffUtc(match.date, match.kickoffEst).getTime()) {
    return "Marcador cerrado (el partido ya comenzó)";
  }
  return null;
}
