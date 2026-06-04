import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";

export type TimezoneKey = "chile" | "spain" | "belgium";

const ZONES: Record<TimezoneKey, { tz: string; label: string; flag: string }> = {
  chile: { tz: "America/Santiago", label: "Chile", flag: "🇨🇱" },
  spain: { tz: "Europe/Madrid", label: "España", flag: "🇪🇸" },
  belgium: { tz: "Europe/Brussels", label: "Bélgica", flag: "🇧🇪" },
};

/** Hora de inicio en Eastern Time (horario FIFA / sede) */
export function getKickoffUtc(date: string, kickoffEst: string): Date {
  const [h, m] = kickoffEst.split(":").map(Number);
  const [year, month, day] = date.split("-").map(Number);
  // EST en junio-julio 2026 ≈ UTC-4 (EDT)
  const utcHour = h + 4;
  return new Date(Date.UTC(year, month - 1, day, utcHour, m, 0));
}

export function formatKickoff(
  date: string,
  kickoffEst: string,
  zone: TimezoneKey,
): { time: string; dateLabel: string } {
  return formatKickoffInZone(date, kickoffEst, ZONES[zone].tz);
}

export function formatKickoffInZone(
  date: string,
  kickoffEst: string,
  ianaTz: string,
): { time: string; dateLabel: string } {
  const utc = getKickoffUtc(date, kickoffEst);
  return {
    time: formatInTimeZone(utc, ianaTz, "HH:mm", { locale: es }),
    dateLabel: formatInTimeZone(utc, ianaTz, "EEE d MMM", { locale: es }),
  };
}

export type ResolvedTimezone = {
  tz: string;
  label: string;
  flag?: string;
  key?: TimezoneKey;
};

/** Mapea la zona IANA del navegador a etiqueta amigable (prioriza CL/ES/BE). */
export function resolveBrowserTimezone(iana: string): ResolvedTimezone {
  for (const key of Object.keys(ZONES) as TimezoneKey[]) {
    if (ZONES[key].tz === iana) {
      const z = ZONES[key];
      return { tz: z.tz, label: z.label, flag: z.flag, key };
    }
  }

  try {
    const parts = new Intl.DateTimeFormat("es", {
      timeZone: iana,
      timeZoneName: "short",
    }).formatToParts(new Date());
    const shortName = parts.find((p) => p.type === "timeZoneName")?.value;
    if (shortName) {
      return { tz: iana, label: shortName };
    }
  } catch {
    /* zona no válida */
  }

  const fallback = iana.split("/").pop()?.replace(/_/g, " ") ?? iana;
  return { tz: iana, label: fallback };
}

export function getAllZoneTimes(date: string, kickoffEst: string) {
  return (Object.keys(ZONES) as TimezoneKey[]).map((key) => ({
    key,
    ...ZONES[key],
    ...formatKickoff(date, kickoffEst, key),
  }));
}

export function isMatchLocked(date: string, kickoffEst: string): boolean {
  return Date.now() >= getKickoffUtc(date, kickoffEst).getTime();
}

export { ZONES };
