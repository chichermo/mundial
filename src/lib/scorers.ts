const MAX_SCORERS = 15;

export function parseScorersJson(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_SCORERS);
  } catch {
    return [];
  }
}

export function scorersToJson(names: string[]): string {
  const cleaned = names
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_SCORERS);
  return JSON.stringify(cleaned);
}

/** Ajusta la lista al número de goles pronosticados (rellena vacíos o recorta). */
export function resizeScorerSlots(current: string[], goalCount: number): string[] {
  const n = Math.max(0, Math.min(goalCount, MAX_SCORERS));
  const next = current.slice(0, n);
  while (next.length < n) next.push("");
  return next;
}

export function normalizeScorersForGoals(
  homeScorers: string[],
  awayScorers: string[],
  homeGoals: number,
  awayGoals: number,
): { homeScorers: string[]; awayScorers: string[] } {
  return {
    homeScorers: resizeScorerSlots(homeScorers, homeGoals).map((s) => s.trim()).filter(Boolean),
    awayScorers: resizeScorerSlots(awayScorers, awayGoals).map((s) => s.trim()).filter(Boolean),
  };
}
