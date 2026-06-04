import { matches } from "@/lib/matches-data";

const groupCount = matches.filter((m) => m.phase === "group").length;
const knockoutCount = matches.filter((m) => m.phase !== "group").length;

export function getPollaProgress(stats: {
  matchPredictions: number;
  knockoutPredictions: number;
  hasTournamentPick: boolean;
}) {
  const groupPct = Math.round((stats.matchPredictions / groupCount) * 100);
  const koPct = Math.round((stats.knockoutPredictions / knockoutCount) * 100);
  const specialsDone = stats.hasTournamentPick ? 1 : 0;

  return {
    group: { done: stats.matchPredictions, total: groupCount, pct: groupPct },
    knockout: { done: stats.knockoutPredictions, total: knockoutCount, pct: koPct },
    specials: { done: specialsDone, total: 1 },
    overallPct: Math.round(
      ((stats.matchPredictions + stats.knockoutPredictions + specialsDone) /
        (groupCount + knockoutCount + 1)) *
        100,
    ),
  };
}
