const API_BASE = "https://v3.football.api-sports.io";

export type ApiFixtureItem = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string };
  };
  league: { id?: number; round?: string };
  teams: {
    home: { name: string; winner?: boolean | null };
    away: { name: string; winner?: boolean | null };
  };
  goals: { home: number | null; away: number | null };
};

export type ApiFixtureResponse = {
  response: ApiFixtureItem[];
  errors?: Record<string, string>;
};

const FINISHED = new Set(["FT", "AET", "PEN", "AWD", "WO"]);
const LIVE = new Set(["1H", "HT", "2H", "ET", "BT", "P", "LIVE"]);

export function isFixtureFinished(short: string): boolean {
  return FINISHED.has(short);
}

export function isFixtureLive(short: string): boolean {
  return LIVE.has(short);
}

export function shouldSyncFixture(short: string): boolean {
  return isFixtureFinished(short) || isFixtureLive(short);
}

async function apiFetch(path: string, apiKey: string): Promise<ApiFixtureResponse> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "x-apisports-key": apiKey,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`API-Football HTTP ${res.status}`);
  }

  const data = (await res.json()) as ApiFixtureResponse;
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(Object.values(data.errors).join("; "));
  }
  return data;
}

export async function fetchWorldCupFixtures(apiKey: string): Promise<ApiFixtureItem[]> {
  const data = await apiFetch("/fixtures?league=1&season=2026", apiKey);
  return data.response ?? [];
}

export async function fetchWorldCupLiveFixtures(apiKey: string): Promise<ApiFixtureItem[]> {
  const data = await apiFetch("/fixtures?live=all", apiKey);
  return (data.response ?? []).filter((f) => f.league?.id === 1);
}

export async function fetchAllRelevantFixtures(apiKey: string): Promise<ApiFixtureItem[]> {
  const [scheduled, live] = await Promise.all([
    fetchWorldCupFixtures(apiKey),
    fetchWorldCupLiveFixtures(apiKey).catch(() => [] as ApiFixtureItem[]),
  ]);

  const byId = new Map<number, ApiFixtureItem>();
  for (const f of scheduled) byId.set(f.fixture.id, f);
  for (const f of live) byId.set(f.fixture.id, f);
  return [...byId.values()];
}
