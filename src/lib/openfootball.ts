export const OPENFOOTBALL_DEFAULT_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

export type OpenFootballMatch = {
  round: string;
  num?: number;
  date: string;
  time?: string;
  team1: string;
  team2: string;
  group?: string;
  ground?: string;
  score?: {
    ft?: [number, number];
    ht?: [number, number];
    et?: [number, number];
    pen?: [number, number];
  };
};

export type OpenFootballData = {
  name: string;
  matches: OpenFootballMatch[];
};

export async function fetchOpenFootballData(
  url = process.env.OPENFOOTBALL_URL ?? OPENFOOTBALL_DEFAULT_URL,
): Promise<OpenFootballData> {
  const res = await fetch(url, {
    next: { revalidate: 0 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`openfootball HTTP ${res.status}`);
  }

  return (await res.json()) as OpenFootballData;
}

export function parseFullTimeScore(
  match: OpenFootballMatch,
): { home: number; away: number } | null {
  const ft = match.score?.ft;
  if (!ft || ft.length < 2) return null;
  const [home, away] = ft;
  if (typeof home !== "number" || typeof away !== "number") return null;
  return { home, away };
}
