import raw from "@/data/matches.json";

export type MatchPhase =
  | "group"
  | "round32"
  | "round16"
  | "quarter"
  | "semi"
  | "third"
  | "final";

export type CountryBroadcast = {
  all: string[];
  freeTv?: string[];
  premium?: string[];
  stream?: string[];
};

export type MatchBroadcast = {
  chile: CountryBroadcast;
  spain: CountryBroadcast;
  belgium: CountryBroadcast;
};

export type Match = {
  id: number;
  date: string;
  kickoffEst: string;
  home: string;
  away: string;
  group: string | null;
  phase: MatchPhase;
  venue: string;
  city: string;
  broadcast: MatchBroadcast;
};

export const { matches, teams } = raw as {
  matches: Match[];
  teams: string[];
};

export function getMatch(id: number): Match | undefined {
  return matches.find((m) => m.id === id);
}

export function getPhaseLabel(phase: MatchPhase): string {
  const labels: Record<MatchPhase, string> = {
    group: "Fase de grupos",
    round32: "Dieciseisavos",
    round16: "Octavos",
    quarter: "Cuartos",
    semi: "Semifinal",
    third: "Tercer puesto",
    final: "Final",
  };
  return labels[phase];
}
