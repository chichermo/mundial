import {
  fetchAllRelevantFixtures,
  shouldSyncFixture,
  type ApiFixtureItem,
} from "@/lib/api-football";
import { logAdminChange } from "@/lib/admin-log";
import { getMatch } from "@/lib/matches-data";
import { resolveMatchId } from "@/lib/fixture-map";
import { normalizeTeamName } from "@/lib/team-aliases";
import { prisma } from "@/lib/prisma";
import type { SyncResult } from "@/lib/sync-types";

function winnerLabel(fixture: ApiFixtureItem, matchId: number): string | null {
  const match = getMatch(matchId);
  if (!match || match.phase === "group") return null;

  const homeGoals = fixture.goals.home;
  const awayGoals = fixture.goals.away;
  if (homeGoals == null || awayGoals == null) return null;
  if (homeGoals === awayGoals) {
    if (fixture.teams.home.winner) return match.home.startsWith("Match") ? fixture.teams.home.name : match.home;
    if (fixture.teams.away.winner) return match.away.startsWith("Match") ? fixture.teams.away.name : match.away;
    return null;
  }

  const apiWinner =
    homeGoals > awayGoals ? fixture.teams.home.name : fixture.teams.away.name;
  const normalized = normalizeTeamName(apiWinner);

  if (normalizeTeamName(match.home) === normalized) return match.home;
  if (normalizeTeamName(match.away) === normalized) return match.away;
  return normalized;
}

export async function syncResultsFromApiFootball(apiKey: string): Promise<SyncResult> {
  const details: string[] = [];
  let updated = 0;
  let skipped = 0;
  let unmapped = 0;

  try {
    const fixtures = await fetchAllRelevantFixtures(apiKey);
    const syncable = fixtures.filter((f) => shouldSyncFixture(f.fixture.status.short));

    for (const fixture of syncable) {
      const matchId = resolveMatchId(fixture);
      if (!matchId) {
        unmapped++;
        continue;
      }

      const homeScore = fixture.goals.home;
      const awayScore = fixture.goals.away;
      if (homeScore == null || awayScore == null) {
        skipped++;
        continue;
      }

      const match = getMatch(matchId);
      const win = winnerLabel(fixture, matchId);

      await prisma.matchResult.upsert({
        where: { matchId },
        create: {
          matchId,
          homeScore,
          awayScore,
          winnerLabel: win,
        },
        update: {
          homeScore,
          awayScore,
          ...(win ? { winnerLabel: win } : {}),
        },
      });

      updated++;
      const label = match
        ? `${match.home} ${homeScore}-${awayScore} ${match.away}`
        : `#${matchId} ${homeScore}-${awayScore}`;
      details.push(`#${matchId} ${label} (${fixture.fixture.status.short})`);
    }

    const summary = `API-Football: ${updated} actualizados, ${skipped} omitidos, ${unmapped} sin mapear`;
    await logAdminChange("api_sync", summary);

    return {
      ok: true,
      source: "api-football",
      updated,
      skipped,
      unmapped,
      noScores: 0,
      totalFetched: fixtures.length,
      details: details.slice(0, 20),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    await logAdminChange("api_sync_error", message);
    return {
      ok: false,
      source: "api-football",
      updated,
      skipped,
      unmapped,
      noScores: 0,
      totalFetched: 0,
      details,
      error: message,
    };
  }
}
