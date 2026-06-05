import fixtureMapData from "@/data/fixture-map.json";
import { matches, type Match } from "@/lib/matches-data";
import { getKickoffUtc } from "@/lib/timezones";
import type { ApiFixtureItem } from "@/lib/api-football";
import { normalizeTeamName, teamsMatch } from "@/lib/team-aliases";

export type FixtureMapEntry = {
  matchId: number;
  fixtureId: number;
  home?: string;
  away?: string;
};

type FixtureMapFile = {
  version: number;
  generatedAt?: string | null;
  entries: FixtureMapEntry[];
};

const mapFile = fixtureMapData as FixtureMapFile;

const fixtureToMatch = new Map(
  mapFile.entries.map((e) => [e.fixtureId, e.matchId]),
);
const matchToFixture = new Map(
  mapFile.entries.map((e) => [e.matchId, e.fixtureId]),
);

export function getFixtureIdForMatch(matchId: number): number | undefined {
  return matchToFixture.get(matchId);
}

export function getMatchIdForFixture(fixtureId: number): number | undefined {
  return fixtureToMatch.get(fixtureId);
}

function sameCalendarDay(fixtureIso: string, matchDate: string): boolean {
  const fixtureDay = fixtureIso.slice(0, 10);
  if (fixtureDay === matchDate) return true;
  const kick = getKickoffUtc(matchDate, "12:00");
  const fixtureDate = new Date(fixtureIso);
  const diffHours = Math.abs(fixtureDate.getTime() - kick.getTime()) / 3_600_000;
  return diffHours <= 18;
}

function kickoffProximity(fixtureIso: string, match: Match): number {
  const fixtureMs = new Date(fixtureIso).getTime();
  const kickMs = getKickoffUtc(match.date, match.kickoffEst).getTime();
  return Math.abs(fixtureMs - kickMs);
}

/** Empareja fixture API con matchId local (mapa JSON + heurística en fase grupos). */
export function resolveMatchId(fixture: ApiFixtureItem): number | undefined {
  const fromMap = getMatchIdForFixture(fixture.fixture.id);
  if (fromMap) return fromMap;

  const apiHome = fixture.teams.home.name;
  const apiAway = fixture.teams.away.name;

  const groupCandidates = matches.filter(
    (m) =>
      m.phase === "group" &&
      teamsMatch(apiHome, apiAway, m.home, m.away) &&
      sameCalendarDay(fixture.fixture.date, m.date),
  );

  if (groupCandidates.length === 1) return groupCandidates[0].id;
  if (groupCandidates.length > 1) {
    groupCandidates.sort(
      (a, b) =>
        kickoffProximity(fixture.fixture.date, a) - kickoffProximity(fixture.fixture.date, b),
    );
    return groupCandidates[0].id;
  }

  const knockoutCandidates = matches.filter(
    (m) => m.phase !== "group" && sameCalendarDay(fixture.fixture.date, m.date),
  );
  if (knockoutCandidates.length === 1) return knockoutCandidates[0].id;
  if (knockoutCandidates.length > 1) {
    knockoutCandidates.sort(
      (a, b) =>
        kickoffProximity(fixture.fixture.date, a) - kickoffProximity(fixture.fixture.date, b),
    );
    return knockoutCandidates[0].id;
  }

  return undefined;
}

export function buildFixtureMapEntries(fixtures: ApiFixtureItem[]): FixtureMapEntry[] {
  const entries: FixtureMapEntry[] = [];
  const used = new Set<number>();

  for (const fixture of fixtures) {
    const matchId = resolveMatchId(fixture);
    if (!matchId || used.has(matchId)) continue;
    used.add(matchId);
    entries.push({
      matchId,
      fixtureId: fixture.fixture.id,
      home: normalizeTeamName(fixture.teams.home.name),
      away: normalizeTeamName(fixture.teams.away.name),
    });
  }

  return entries.sort((a, b) => a.matchId - b.matchId);
}

export function getFixtureMapMeta() {
  return {
    version: mapFile.version,
    generatedAt: mapFile.generatedAt,
    count: mapFile.entries.length,
  };
}
