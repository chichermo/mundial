import { logAdminChange } from "@/lib/admin-log";
import {
  fetchAllEspnEvents,
  getScoreboardDates,
  isEspnMatchFinished,
  type EspnEvent,
} from "@/lib/espn";
import { resolveMatchIdByTeams } from "@/lib/fixture-map";
import { getMatch } from "@/lib/matches-data";
import { prisma } from "@/lib/prisma";
import type { SyncResult } from "@/lib/sync-types";

function parseScore(value: string | undefined): number | null {
  if (value == null || value === "") return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function scoresFromEvent(event: EspnEvent): {
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
} | null {
  const competition = event.competitions[0];
  if (!competition) return null;

  const home = competition.competitors.find((c) => c.homeAway === "home");
  const away = competition.competitors.find((c) => c.homeAway === "away");
  if (!home?.team?.displayName || !away?.team?.displayName) return null;

  const homeScore = parseScore(home.score);
  const awayScore = parseScore(away.score);
  if (homeScore == null || awayScore == null) return null;

  return {
    homeName: home.team.displayName,
    awayName: away.team.displayName,
    homeScore,
    awayScore,
  };
}

export async function syncResultsFromEspn(): Promise<SyncResult> {
  const details: string[] = [];
  let updated = 0;
  const skipped = 0;
  let unmapped = 0;
  let noScores = 0;

  try {
    const dates = getScoreboardDates();
    const events = await fetchAllEspnEvents(dates);
    const finished = events.filter(isEspnMatchFinished);

    for (const event of finished) {
      const scores = scoresFromEvent(event);
      if (!scores) {
        noScores++;
        continue;
      }

      const eventDate = event.competitions[0]?.date ?? event.date;
      const matchId = resolveMatchIdByTeams(
        eventDate,
        scores.homeName,
        scores.awayName,
      );
      if (!matchId) {
        unmapped++;
        continue;
      }

      const match = getMatch(matchId);
      await prisma.matchResult.upsert({
        where: { matchId },
        create: {
          matchId,
          homeScore: scores.homeScore,
          awayScore: scores.awayScore,
          winnerLabel: null,
        },
        update: {
          homeScore: scores.homeScore,
          awayScore: scores.awayScore,
        },
      });

      updated++;
      const label = match
        ? `${match.home} ${scores.homeScore}-${scores.awayScore} ${match.away}`
        : `#${matchId}`;
      details.push(`#${matchId} ${label}`);
    }

    const summary = `ESPN: ${updated} actualizados, ${noScores} sin marcador, ${unmapped} sin mapear (${dates.join(",")})`;
    await logAdminChange("espn_sync", summary);

    return {
      ok: true,
      source: "espn",
      updated,
      skipped,
      unmapped,
      noScores,
      totalFetched: events.length,
      details: details.slice(0, 25),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    await logAdminChange("espn_sync_error", message);
    return {
      ok: false,
      source: "espn",
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
