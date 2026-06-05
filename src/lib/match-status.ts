import type { Match } from "@/lib/matches-data";
import { getKickoffUtc } from "@/lib/timezones";

export type MatchStatus = "pending" | "live" | "finished";

const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

export function getMatchStatus(
  match: Pick<Match, "date" | "kickoffEst">,
  result: { homeScore: number | null; awayScore: number | null } | null | undefined,
): MatchStatus {
  if (result?.homeScore != null && result.awayScore != null) return "finished";
  const kick = getKickoffUtc(match.date, match.kickoffEst).getTime();
  const now = Date.now();
  if (now < kick) return "pending";
  if (now < kick + MATCH_DURATION_MS) return "live";
  return "pending";
}

export function statusLabel(status: MatchStatus): string {
  const labels: Record<MatchStatus, string> = {
    pending: "Pendiente",
    live: "En juego",
    finished: "Finalizado",
  };
  return labels[status];
}

export function statusClass(status: MatchStatus): string {
  const classes: Record<MatchStatus, string> = {
    pending: "bg-pitch-mid/60 text-muted",
    live: "bg-red-500/20 text-red-300",
    finished: "bg-lime/15 text-lime",
  };
  return classes[status];
}
