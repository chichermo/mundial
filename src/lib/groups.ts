import { prisma } from "@/lib/prisma";
import { getTournamentAnswers } from "@/lib/global-answers";
import { matches } from "@/lib/matches-data";
import { getMatchPoints, getTournamentPoints, SCORING_RULES } from "@/lib/scoring";

export async function getLeaderboard(groupId: string) {
  const members = await prisma.member.findMany({
    where: { groupId },
    include: {
      matchPredictions: true,
      knockoutPredictions: true,
      tournamentPick: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const results = await prisma.matchResult.findMany();
  const resultMap = new Map(results.map((r) => [r.matchId, r]));

  const tournamentAnswers = await getTournamentAnswers();

  return members.map((member) => {
    let matchPts = 0;
    let knockoutPts = 0;

    for (const pred of member.matchPredictions) {
      const result = resultMap.get(pred.matchId);
      if (result?.homeScore != null && result.awayScore != null) {
        matchPts += getMatchPoints(pred, {
          homeScore: result.homeScore,
          awayScore: result.awayScore,
        });
      }
    }

    for (const kp of member.knockoutPredictions) {
      const result = resultMap.get(kp.matchId);
      if (result?.winnerLabel && kp.winnerLabel === result.winnerLabel) {
        knockoutPts += SCORING_RULES.knockoutWinner;
      }
    }

    const tournamentPts = getTournamentPoints(
      member.tournamentPick,
      tournamentAnswers,
    );

    const total = matchPts + knockoutPts + tournamentPts;

    return {
      id: member.id,
      name: member.name,
      matchPts,
      knockoutPts,
      tournamentPts,
      total,
      predictions: member.matchPredictions.length,
      maxMatches: matches.length,
    };
  }).sort((a, b) => b.total - a.total);
}
