import { logAdminChange } from "@/lib/admin-log";
import { getMatch } from "@/lib/matches-data";
import {
  fetchOpenFootballData,
  parseFullTimeScore,
  type OpenFootballMatch,
} from "@/lib/openfootball";
import {
  resolveOpenFootballMatchId,
  winnerLabelFromOpenFootball,
} from "@/lib/openfootball-map";
import { prisma } from "@/lib/prisma";
import type { SyncResult } from "@/lib/sync-types";

export async function syncResultsFromOpenFootball(): Promise<SyncResult> {
  const details: string[] = [];
  let updated = 0;
  const skipped = 0;
  let unmapped = 0;
  let noScores = 0;

  try {
    const data = await fetchOpenFootballData();
    const entries = data.matches ?? [];

    for (const entry of entries) {
      const scores = parseFullTimeScore(entry);
      if (!scores) {
        noScores++;
        continue;
      }

      const matchId = resolveOpenFootballMatchId(entry);
      if (!matchId) {
        unmapped++;
        continue;
      }

      const match = getMatch(matchId);
      const win = winnerLabelFromOpenFootball(
        matchId,
        entry,
        scores.home,
        scores.away,
      );

      await prisma.matchResult.upsert({
        where: { matchId },
        create: {
          matchId,
          homeScore: scores.home,
          awayScore: scores.away,
          winnerLabel: win,
        },
        update: {
          homeScore: scores.home,
          awayScore: scores.away,
          ...(win ? { winnerLabel: win } : {}),
        },
      });

      updated++;
      const label = match
        ? `${match.home} ${scores.home}-${scores.away} ${match.away}`
        : `#${matchId}`;
      details.push(`#${matchId} ${label}`);
    }

    const summary = `openfootball: ${updated} actualizados, ${noScores} sin marcador aún, ${unmapped} sin mapear`;
    await logAdminChange("openfootball_sync", summary);

    return {
      ok: true,
      source: "openfootball",
      updated,
      skipped,
      unmapped,
      noScores,
      totalFetched: entries.length,
      details: details.slice(0, 25),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    await logAdminChange("openfootball_sync_error", message);
    return {
      ok: false,
      source: "openfootball",
      updated,
      skipped,
      unmapped,
      noScores,
      totalFetched: 0,
      details,
      error: message,
    };
  }
}

export type { OpenFootballMatch };
