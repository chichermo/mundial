import type { Match, MatchPhase } from "@/lib/matches-data";
import { matches, getPhaseLabel } from "@/lib/matches-data";

export type BracketMatchResult = {
  homeScore: number | null;
  awayScore: number | null;
  winnerLabel?: string | null;
};

export type BracketSlot = {
  match: Match;
  /** Partidos cuyo ganador alimenta este cruce (solo octavos en adelante). */
  feedsFrom?: [number, number];
};

export type BracketRound = {
  phase: MatchPhase;
  label: string;
  slots: BracketSlot[];
};

/** Enlaces del cuadro FIFA: cada octavo+ depende de ganadores de dieciseisavos. */
export const FEEDERS: Record<number, [number, number]> = {
  89: [74, 77],
  90: [73, 75],
  91: [76, 78],
  92: [79, 80],
  93: [83, 84],
  94: [81, 82],
  95: [86, 88],
  96: [85, 87],
  97: [89, 90],
  98: [93, 94],
  99: [91, 92],
  100: [95, 96],
  101: [97, 98],
  102: [99, 100],
  103: [101, 102],
  104: [101, 102],
};

const ROUND_ORDER: MatchPhase[] = [
  "round32",
  "round16",
  "quarter",
  "semi",
  "third",
  "final",
];

export function buildKnockoutBracket(): BracketRound[] {
  return ROUND_ORDER.map((phase) => {
    const phaseMatches = matches.filter((m) => m.phase === phase);
    return {
      phase,
      label: getPhaseLabel(phase),
      slots: phaseMatches.map((match) => ({
        match,
        feedsFrom: FEEDERS[match.id],
      })),
    };
  });
}

export function getWinnerName(
  match: Match,
  result?: BracketMatchResult | null,
): string | null {
  if (result?.winnerLabel) return result.winnerLabel;
  if (result?.homeScore == null || result?.awayScore == null) return null;
  if (result.homeScore > result.awayScore) return match.home;
  if (result.awayScore > result.homeScore) return match.away;
  return null;
}

export function resolveFeederLabel(
  matchId: number,
  results: Record<number, BracketMatchResult | undefined>,
): string {
  const m = matches.find((x) => x.id === matchId);
  if (!m) return `#${matchId}`;
  const w = getWinnerName(m, results[matchId]);
  return w ?? `Gan. #${matchId}`;
}
