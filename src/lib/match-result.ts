import { getMatch } from "@/lib/matches-data";
import { getKickoffUtc } from "@/lib/timezones";
import { prisma } from "@/lib/prisma";

export type MatchResultRow = {
  matchId: number;
  homeScore: number | null;
  awayScore: number | null;
  winnerLabel?: string | null;
};

export type MatchResultView = {
  homeScore: number | null;
  awayScore: number | null;
  winnerLabel?: string | null;
};

/** Resultado guardado antes del pitido programado (p. ej. sync ESPN mal mapeado). */
export function isPrematureResult(
  match: { date: string; kickoffEst: string },
  result?: { homeScore: number | null; awayScore: number | null } | null,
): boolean {
  if (result?.homeScore == null || result?.awayScore == null) return false;
  return Date.now() < getKickoffUtc(match.date, match.kickoffEst).getTime();
}

export function toEffectiveResult(row: MatchResultRow): MatchResultView {
  const match = getMatch(row.matchId);
  if (!match || isPrematureResult(match, row)) {
    return { homeScore: null, awayScore: null, winnerLabel: null };
  }
  return {
    homeScore: row.homeScore,
    awayScore: row.awayScore,
    winnerLabel: row.winnerLabel,
  };
}

export function mapEffectiveResults(
  rows: MatchResultRow[],
): Record<number, MatchResultView> {
  const out: Record<number, MatchResultView> = {};
  for (const row of rows) {
    out[row.matchId] = toEffectiveResult(row);
  }
  return out;
}

/** Elimina de la BD resultados registrados antes del pitido. */
export async function purgePrematureResults(): Promise<number> {
  const all = await prisma.matchResult.findMany({
    where: { homeScore: { not: null }, awayScore: { not: null } },
  });

  let purged = 0;
  for (const row of all) {
    const match = getMatch(row.matchId);
    if (match && isPrematureResult(match, row)) {
      await prisma.matchResult.delete({ where: { matchId: row.matchId } });
      purged++;
    }
  }
  return purged;
}
