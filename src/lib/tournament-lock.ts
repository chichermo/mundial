import { matches } from "@/lib/matches-data";
import { getKickoffUtc } from "@/lib/timezones";

let mundialStartMs: number | null = null;

/** Hora UTC del primer pitido del torneo (partido más temprano en el calendario). */
export function getMundialStartMs(): number {
  if (mundialStartMs == null) {
    mundialStartMs = Math.min(
      ...matches.map((m) => getKickoffUtc(m.date, m.kickoffEst).getTime()),
    );
  }
  return mundialStartMs;
}

export function isTournamentLocked(now = Date.now()): boolean {
  return now >= getMundialStartMs();
}

export function tournamentLockMessage(): string {
  const d = new Date(getMundialStartMs());
  const label = d.toLocaleString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  });
  return `Cerrado desde el inicio del Mundial (${label} CDMX)`;
}
