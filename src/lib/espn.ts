import { matches } from "@/lib/matches-data";

const ESPN_SCOREBOARD =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

const LOOKBACK_DAYS = 5;

export type EspnCompetitor = {
  homeAway: "home" | "away";
  score?: string;
  winner?: boolean;
  team: {
    displayName: string;
    abbreviation?: string;
  };
};

export type EspnEvent = {
  id: string;
  date: string;
  name: string;
  competitions: Array<{
    id: string;
    date: string;
    status: {
      type: {
        completed?: boolean;
        state?: string;
        description?: string;
        name?: string;
      };
    };
    competitors: EspnCompetitor[];
  }>;
};

export type EspnScoreboard = {
  events?: EspnEvent[];
};

export function formatEspnDate(isoDate: string): string {
  return isoDate.slice(0, 10).replace(/-/g, "");
}

function isoDaysAgo(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export function getScoreboardDates(todayIso = new Date().toISOString().slice(0, 10)): string[] {
  const dates = new Set<string>();
  const earliest = isoDaysAgo(todayIso, LOOKBACK_DAYS);

  const base = new Date(`${todayIso}T12:00:00Z`);
  for (let offset = -2; offset <= 0; offset++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + offset);
    dates.add(formatEspnDate(d.toISOString()));
  }

  for (const m of matches) {
    if (m.date > todayIso || m.date < earliest) continue;
    dates.add(m.date.replace(/-/g, ""));
  }

  return [...dates].sort();
}

export function isEspnMatchFinished(event: EspnEvent): boolean {
  const status = event.competitions[0]?.status?.type;
  if (!status) return false;
  if (status.completed) return true;
  if (status.state === "post") return true;
  const name = status.name ?? "";
  return name === "STATUS_FULL_TIME" || name === "STATUS_FINAL";
}

export async function fetchEspnScoreboard(dateYyyymmdd: string): Promise<EspnScoreboard> {
  const url = `${ESPN_SCOREBOARD}?dates=${dateYyyymmdd}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`ESPN scoreboard ${dateYyyymmdd}: HTTP ${res.status}`);
  }
  return (await res.json()) as EspnScoreboard;
}

export async function fetchAllEspnEvents(dates?: string[]): Promise<EspnEvent[]> {
  const toFetch = dates ?? getScoreboardDates();
  const events: EspnEvent[] = [];
  const seen = new Set<string>();

  for (const date of toFetch) {
    const board = await fetchEspnScoreboard(date);
    for (const event of board.events ?? []) {
      if (seen.has(event.id)) continue;
      seen.add(event.id);
      events.push(event);
    }
  }

  return events;
}
