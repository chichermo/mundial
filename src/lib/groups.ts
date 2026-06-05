import { prisma } from "@/lib/prisma";
import { getTournamentAnswers } from "@/lib/global-answers";
import { getMatch, matches } from "@/lib/matches-data";
import { POLL_CONFIG } from "@/lib/poll-config";
import { getMatchPoints, getTournamentPoints, SCORING_RULES } from "@/lib/scoring";

const GROUP_MATCH_IDS = matches.filter((m) => m.phase === "group").map((m) => m.id);

export type MatchCell = {
  matchId: number;
  prediction: string | null;
  result: string | null;
  points: number;
};

export type StandingsRow = {
  id: string;
  name: string;
  groupPts: number;
  knockoutPts: number;
  tournamentPts: number;
  total: number;
  rank: number;
  qualified: boolean;
  provisionalQualified: boolean;
  predictions: number;
  maxGroupMatches: number;
  matchCells: MatchCell[];
};

export type LiveStandings = {
  rows: StandingsRow[];
  finishedMatches: {
    id: number;
    label: string;
    home: string;
    away: string;
    result: string;
  }[];
  groupStageComplete: boolean;
  maxMembers: number;
  qualifiersCount: number;
  memberCount: number;
  updatedAt: string;
};

function isGroupResultComplete(
  result: { homeScore: number | null; awayScore: number | null } | undefined,
): result is { homeScore: number; awayScore: number } {
  return result?.homeScore != null && result?.awayScore != null;
}

export async function computeLiveStandings(groupId: string): Promise<LiveStandings> {
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

  const finishedGroupMatches = GROUP_MATCH_IDS.filter((id) =>
    isGroupResultComplete(resultMap.get(id)),
  ).map((id) => {
    const m = getMatch(id)!;
    const r = resultMap.get(id)!;
    return {
      id,
      label: `#${id}`,
      home: m.home,
      away: m.away,
      result: `${r.homeScore}-${r.awayScore}`,
    };
  });

  const groupStageComplete = finishedGroupMatches.length === GROUP_MATCH_IDS.length;

  const rawRows = members.map((member) => {
    let groupPts = 0;
    let knockoutPts = 0;
    const matchCells: MatchCell[] = [];

    for (const matchId of finishedGroupMatches.map((m) => m.id)) {
      const pred = member.matchPredictions.find((p) => p.matchId === matchId);
      const result = resultMap.get(matchId);
      let points = 0;
      if (pred && isGroupResultComplete(result)) {
        points = getMatchPoints(pred, {
          homeScore: result.homeScore,
          awayScore: result.awayScore,
        });
        groupPts += points;
      }
      matchCells.push({
        matchId,
        prediction: pred ? `${pred.homeScore}-${pred.awayScore}` : null,
        result: isGroupResultComplete(result)
          ? `${result.homeScore}-${result.awayScore}`
          : null,
        points,
      });
    }

    for (const kp of member.knockoutPredictions) {
      const result = resultMap.get(kp.matchId);
      if (result?.winnerLabel && kp.winnerLabel === result.winnerLabel) {
        knockoutPts += SCORING_RULES.knockoutWinner;
      }
    }

    const tournamentPts = getTournamentPoints(member.tournamentPick, tournamentAnswers);

    return {
      id: member.id,
      name: member.name,
      groupPts,
      knockoutPts,
      tournamentPts,
      predictions: member.matchPredictions.length,
      maxGroupMatches: GROUP_MATCH_IDS.length,
      matchCells,
    };
  });

  const byGroupPts = [...rawRows].sort((a, b) => b.groupPts - a.groupPts);
  const qualifiedIds = new Set(
    byGroupPts.slice(0, POLL_CONFIG.qualifiersCount).map((r) => r.id),
  );

  const rows: StandingsRow[] = byGroupPts.map((row, index) => {
    const rank = index + 1;
    const qualified = groupStageComplete && qualifiedIds.has(row.id);
    const provisionalQualified = !groupStageComplete && rank <= POLL_CONFIG.qualifiersCount;
    const knockoutCounted =
      !groupStageComplete ? 0 : qualified ? row.knockoutPts : 0;

    return {
      ...row,
      rank,
      qualified,
      provisionalQualified,
      total: row.groupPts + knockoutCounted + row.tournamentPts,
    };
  });

  rows.sort((a, b) => b.total - a.total || b.groupPts - a.groupPts);
  rows.forEach((row, i) => {
    row.rank = i + 1;
  });

  return {
    rows,
    finishedMatches: finishedGroupMatches,
    groupStageComplete,
    maxMembers: POLL_CONFIG.maxMembers,
    qualifiersCount: POLL_CONFIG.qualifiersCount,
    memberCount: members.length,
    updatedAt: new Date().toISOString(),
  };
}

export async function getLeaderboard(groupId: string) {
  const data = await computeLiveStandings(groupId);
  return data.rows.map((row) => ({
    id: row.id,
    name: row.name,
    matchPts: row.groupPts,
    knockoutPts: row.knockoutPts,
    tournamentPts: row.tournamentPts,
    total: row.total,
    predictions: row.predictions,
    maxMatches: row.maxGroupMatches,
    rank: row.rank,
    qualified: row.qualified,
    provisionalQualified: row.provisionalQualified,
  }));
}

export async function isMemberQualifiedForKnockout(
  memberId: string,
  groupId: string,
): Promise<boolean> {
  const data = await computeLiveStandings(groupId);
  const row = data.rows.find((r) => r.id === memberId);
  if (!row) return false;
  if (!data.groupStageComplete) return true;
  return row.qualified;
}
