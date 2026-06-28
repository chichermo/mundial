import { ensureDbSchema } from "@/lib/ensure-db-schema";
import { isMissingColumnError } from "@/lib/db-errors";
import { getFeaturedMatch } from "@/lib/app-config";
import { getTournamentAnswers } from "@/lib/global-answers";
import { prisma } from "@/lib/prisma";
import { knockoutLabelsMatch } from "@/lib/knockout-labels";
import { getMatch, matches } from "@/lib/matches-data";
import { POLL_CONFIG } from "@/lib/poll-config";
import { getMatchPoints, getKnockoutPoints, getTournamentPoints } from "@/lib/scoring";

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

/** Puntaje mínimo de fase de grupos para estar en zona (incluye empates en el corte). */
export function getQualificationCutoffGroupPts(
  groupPtsSortedDesc: number[],
  qualifiersCount: number,
): number {
  if (groupPtsSortedDesc.length === 0) return 0;
  const idx = Math.min(qualifiersCount, groupPtsSortedDesc.length) - 1;
  return groupPtsSortedDesc[idx]!;
}

export function isInQualificationZone(groupPts: number, cutoffGroupPts: number): boolean {
  return groupPts >= cutoffGroupPts;
}

export async function computeLiveStandings(groupId: string): Promise<LiveStandings> {
  const hasScorerColumns = await ensureDbSchema();

  const predictionInclude = hasScorerColumns
    ? { matchPredictions: true as const }
    : {
        matchPredictions: {
          select: { matchId: true, homeScore: true, awayScore: true },
        },
      };

  let members;
  const knockoutInclude = { knockoutPredictions: true as const };
  const knockoutLegacy = {
    knockoutPredictions: { select: { matchId: true, winnerLabel: true } },
  } as const;

  try {
    members = await prisma.member.findMany({
      where: { groupId },
      include: {
        ...predictionInclude,
        ...knockoutInclude,
        tournamentPick: true,
      },
      orderBy: { createdAt: "asc" },
    });
  } catch (err) {
    if (!isMissingColumnError(err)) throw err;
    try {
      members = await prisma.member.findMany({
        where: { groupId },
        include: {
          matchPredictions: {
            select: { matchId: true, homeScore: true, awayScore: true },
          },
          ...knockoutLegacy,
          tournamentPick: true,
        },
        orderBy: { createdAt: "asc" },
      });
    } catch (inner) {
      if (!isMissingColumnError(inner)) throw inner;
      members = await prisma.member.findMany({
        where: { groupId },
        include: {
          ...predictionInclude,
          ...knockoutLegacy,
          tournamentPick: true,
        },
        orderBy: { createdAt: "asc" },
      });
    }
  }

  const results = await prisma.matchResult.findMany();
  const resultMap = new Map(results.map((r) => [r.matchId, r]));
  const tournamentAnswers = await getTournamentAnswers();
  const featured = await getFeaturedMatch();

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
        if (
          featured &&
          matchId === featured.match.id &&
          points > 0
        ) {
          points *= featured.multiplier;
        }
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
      if (
        result?.homeScore != null &&
        result?.awayScore != null
      ) {
        const pick = kp as {
          winnerLabel: string;
          homeScore?: number | null;
          awayScore?: number | null;
        };
        knockoutPts += getKnockoutPoints(
          {
            homeScore: pick.homeScore ?? null,
            awayScore: pick.awayScore ?? null,
            winnerLabel: pick.winnerLabel,
          },
          {
            homeScore: result.homeScore,
            awayScore: result.awayScore,
            winnerLabel: result.winnerLabel,
          },
          { winnerMatch: knockoutLabelsMatch },
        );
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
  const cutoffGroupPts = getQualificationCutoffGroupPts(
    byGroupPts.map((r) => r.groupPts),
    POLL_CONFIG.qualifiersCount,
  );

  const rows: StandingsRow[] = byGroupPts.map((row, index) => {
    const rank = index + 1;
    const inZone = isInQualificationZone(row.groupPts, cutoffGroupPts);
    const qualified = groupStageComplete && inZone;
    const provisionalQualified = !groupStageComplete && inZone;
    const knockoutCounted = groupStageComplete ? row.knockoutPts : 0;

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
  return data.groupStageComplete;
}
