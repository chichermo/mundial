import { getKickoffUtc } from "@/lib/timezones";

export type MatchResultLike = {
  homeScore: number | null;
  awayScore: number | null;
} | null | undefined;

export type MatchSchedule = {
  date: string;
  kickoffEst: string;
};

/** Excepción puntual: Sudáfrica–Canadá (#75) abierto hasta el entretiempo. */
export const HALFTIME_BETTING_GRACE_MATCH_ID = 75;

/** Duración del 1er tiempo (45' + margen de descuento). */
const FIRST_HALF_MS = 48 * 60 * 1000;

function kickoffMs(match: MatchSchedule): number {
  return getKickoffUtc(match.date, match.kickoffEst).getTime();
}

export function hasHalftimeBettingGrace(matchId: number): boolean {
  return matchId === HALFTIME_BETTING_GRACE_MATCH_ID;
}

/** true si #75 está en ventana post-pitido pero antes del entretiempo. */
export function isHalftimeBettingGraceActive(
  matchId: number,
  match: MatchSchedule,
  result?: MatchResultLike,
): boolean {
  if (!hasHalftimeBettingGrace(matchId) || hasOfficialResult(result)) return false;
  const kick = kickoffMs(match);
  const now = Date.now();
  return now >= kick && now < kick + FIRST_HALF_MS;
}

function lockAtMs(matchId: number | undefined, match: MatchSchedule): number {
  const kick = kickoffMs(match);
  if (matchId != null && hasHalftimeBettingGrace(matchId)) return kick + FIRST_HALF_MS;
  return kick;
}

/** Partido cerrado: ya empezó (o entretiempo en #75) o tiene resultado oficial. */
export function isPredictionLocked(
  match: MatchSchedule,
  result?: MatchResultLike,
  matchId?: number,
): boolean {
  if (hasOfficialResult(result)) return true;
  return Date.now() >= lockAtMs(matchId, match);
}

export function hasOfficialResult(result?: MatchResultLike): boolean {
  return result?.homeScore != null && result?.awayScore != null;
}

export function lockReason(
  match: MatchSchedule,
  result?: MatchResultLike,
  matchId?: number,
): string | null {
  if (hasOfficialResult(result)) return "Marcador cerrado (partido finalizado)";
  const kick = kickoffMs(match);
  const now = Date.now();
  if (matchId != null && hasHalftimeBettingGrace(matchId) && now >= kick + FIRST_HALF_MS) {
    return "Marcador cerrado (entretiempo — excepción #75)";
  }
  if (matchId != null && hasHalftimeBettingGrace(matchId) && now >= kick && now < kick + FIRST_HALF_MS) {
    return "Apuestas abiertas hasta el entretiempo";
  }
  if (now >= kick) {
    return "Marcador cerrado (el partido ya comenzó)";
  }
  return null;
}
