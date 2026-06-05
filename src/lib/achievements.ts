import { SCORING_RULES, getMatchPoints } from "@/lib/scoring";

export type Achievement = {
  id: string;
  label: string;
  emoji: string;
  earned: boolean;
};

type MemberStats = {
  name: string;
  predictions: { matchId: number; homeScore: number; awayScore: number }[];
  results: Map<number, { homeScore: number; awayScore: number }>;
};

export function computeAchievements(stats: MemberStats): Achievement[] {
  let exact = 0;
  let outcome = 0;
  let streak = 0;
  let maxStreak = 0;

  const sorted = [...stats.predictions].sort((a, b) => a.matchId - b.matchId);
  for (const pred of sorted) {
    const result = stats.results.get(pred.matchId);
    if (!result) continue;
    const pts = getMatchPoints(pred, result);
    if (pts === SCORING_RULES.exactScore) {
      exact++;
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else if (pts === SCORING_RULES.correctResult) {
      outcome++;
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
  }

  return [
    { id: "first-exact", label: "Primer exacto", emoji: "🎯", earned: exact >= 1 },
    { id: "three-exact", label: "3 marcadores exactos", emoji: "🔥", earned: exact >= 3 },
    { id: "streak-3", label: "Racha de 3 aciertos", emoji: "⚡", earned: maxStreak >= 3 },
    { id: "ten-outcome", label: "10 resultados L/E/V", emoji: "📊", earned: outcome + exact >= 10 },
    { id: "active", label: "10+ pronósticos", emoji: "✅", earned: stats.predictions.length >= 10 },
  ];
}
