import { matches, type MatchPhase } from "@/lib/matches-data";
import { findCurrentMatch } from "@/lib/match-order";
import { getKickoffUtc } from "@/lib/timezones";

export type TournamentPhase =
  | "pre"
  | "group"
  | "round32"
  | "round16"
  | "quarter"
  | "semi"
  | "final_week"
  | "finished";

const GROUP_END = "2026-06-27";
const FINAL_DATE = "2026-07-19";

export function getTournamentPhase(now = new Date()): TournamentPhase {
  const today = now.toISOString().slice(0, 10);
  if (today < "2026-06-11") return "pre";
  if (today <= GROUP_END) return "group";
  if (today <= "2026-07-03") return "round32";
  if (today <= "2026-07-07") return "round16";
  if (today <= "2026-07-11") return "quarter";
  if (today <= "2026-07-15") return "semi";
  if (today < FINAL_DATE) return "final_week";
  const final = matches.find((m) => m.id === 104);
  if (final && now.getTime() >= getKickoffUtc(final.date, final.kickoffEst).getTime() + 2 * 60 * 60 * 1000) {
    return "finished";
  }
  return "final_week";
}

export function getPhaseHeadline(phase: TournamentPhase): string {
  const labels: Record<TournamentPhase, string> = {
    pre: "Faltan días para el arranque",
    group: "Fase de grupos en curso",
    round32: "Dieciseisavos de final",
    round16: "Octavos de final",
    quarter: "Cuartos de final",
    semi: "Semifinales",
    final_week: "Recta final",
    finished: "Mundial finalizado",
  };
  return labels[phase];
}

export function getNextUpcomingMatch(
  results: Record<number, { homeScore: number | null; awayScore: number | null } | undefined> = {},
) {
  const current = findCurrentMatch(matches, results);
  if (current) return current;

  const now = Date.now();
  return (
    [...matches]
      .sort(
        (a, b) =>
          getKickoffUtc(a.date, a.kickoffEst).getTime() -
          getKickoffUtc(b.date, b.kickoffEst).getTime(),
      )
      .find((m) => {
        const r = results[m.id];
        const finished = r?.homeScore != null && r?.awayScore != null;
        return !finished && getKickoffUtc(m.date, m.kickoffEst).getTime() > now;
      }) ?? null
  );
}

export function matchesForPhase(phase: MatchPhase) {
  return matches.filter((m) => m.phase === phase);
}

export function isPreTournament(now = new Date()): boolean {
  return getTournamentPhase(now) === "pre";
}

export function isKnockoutPhase(now = new Date()): boolean {
  const p = getTournamentPhase(now);
  return p !== "pre" && p !== "group";
}
