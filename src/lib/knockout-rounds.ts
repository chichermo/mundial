import type { MatchPhase } from "@/lib/matches-data";
import { matches, getPhaseLabel } from "@/lib/matches-data";
import {
  FEEDERS,
  getWinnerName,
  type BracketMatchResult,
} from "@/lib/knockout-bracket";

export const KNOCKOUT_PHASE_ORDER: MatchPhase[] = [
  "round32",
  "round16",
  "quarter",
  "semi",
  "third",
  "final",
];

export function isOfficialResult(r?: BracketMatchResult | null): boolean {
  return r?.homeScore != null && r?.awayScore != null;
}

export function isPhaseComplete(
  phase: MatchPhase,
  results: Record<number, BracketMatchResult | undefined>,
): boolean {
  const phaseMatches = matches.filter((m) => m.phase === phase);
  if (phaseMatches.length === 0) return false;
  return phaseMatches.every((m) => isOfficialResult(results[m.id]));
}

export function getActiveKnockoutPhase(
  results: Record<number, BracketMatchResult | undefined>,
): MatchPhase {
  for (const phase of KNOCKOUT_PHASE_ORDER) {
    if (!isPhaseComplete(phase, results)) return phase;
  }
  return "final";
}

export function getCompletedKnockoutPhases(
  results: Record<number, BracketMatchResult | undefined>,
): MatchPhase[] {
  return KNOCKOUT_PHASE_ORDER.filter((p) => isPhaseComplete(p, results));
}

export function resolveDisplayTeams(
  matchId: number,
  results: Record<number, BracketMatchResult | undefined>,
): { home: string; away: string } {
  const m = matches.find((x) => x.id === matchId);
  if (!m) return { home: "?", away: "?" };

  const placeholder = (name: string) =>
    name.startsWith("Match ") ||
    name.startsWith("Group ") ||
    name.startsWith("3er") ||
    name.includes("Winner") ||
    name.includes("Loser") ||
    name.includes("3rd") ||
    name.includes("Runners Up") ||
    name.includes("Winners");

  let home = m.home;
  let away = m.away;

  if (placeholder(home) || placeholder(away)) {
    const feeders = FEEDERS[matchId];
    if (feeders) {
      const [a, b] = feeders;
      const ma = matches.find((x) => x.id === a);
      const mb = matches.find((x) => x.id === b);
      if (ma) home = getWinnerName(ma, results[a]) ?? `Gan. #${a}`;
      if (mb) away = getWinnerName(mb, results[b]) ?? `Gan. #${b}`;
    }
  }

  return { home, away };
}

export function phaseLabel(phase: MatchPhase): string {
  const labels: Partial<Record<MatchPhase, string>> = {
    round32: "Dieciseisavos de final",
    round16: "Octavos de final",
    quarter: "Cuartos de final",
    semi: "Semifinales",
    third: "Tercer puesto",
    final: "Final",
  };
  return labels[phase] ?? getPhaseLabel(phase);
}

/** Mitad izquierda y derecha del cuadro (orden visual FIFA). */
export function splitBracketHalves(phase: MatchPhase): { left: number[]; right: number[] } {
  const ids = matches.filter((m) => m.phase === phase).map((m) => m.id);
  const half = Math.ceil(ids.length / 2);
  return { left: ids.slice(0, half), right: ids.slice(half) };
}
