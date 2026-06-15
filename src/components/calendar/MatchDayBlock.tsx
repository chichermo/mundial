import type { Match } from "@/lib/matches-data";
import { formatMatchDayLabel } from "@/lib/match-order";
import { MatchCard } from "@/components/MatchCard";
import { MatchListRow } from "./MatchListRow";

type ViewMode = "compact" | "detailed";

type ResultRow = { homeScore: number | null; awayScore: number | null };

type Props = {
  date: string;
  matches: Match[];
  viewMode: ViewMode;
  resultsMap?: Map<number, ResultRow>;
};

export function MatchDayBlock({ date, matches, viewMode, resultsMap }: Props) {
  const label = formatMatchDayLabel(date);

  if (viewMode === "compact") {
    return (
      <section className="overflow-hidden rounded-xl border border-pitch-mid/50 bg-pitch-light/40">
        <h2 className="relative z-0 border-b border-pitch-mid/50 bg-pitch-mid/25 px-3 py-2.5 font-display text-sm capitalize leading-tight text-gold sm:px-4">
          {label}
        </h2>
        <div className="relative z-0 divide-y divide-pitch-mid/20">
          {matches.map((m) => (
            <MatchListRow key={m.id} match={m} result={resultsMap?.get(m.id)} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="font-display text-base capitalize text-gold sm:text-lg">{label}</h2>
      <div className="space-y-4">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} result={resultsMap?.get(m.id)} />
        ))}
      </div>
    </section>
  );
}

function resolveViewMode(match: Match, mode: "auto" | ViewMode): ViewMode {
  if (mode !== "auto") return mode;
  return match.phase === "group" ? "compact" : "detailed";
}

export function getViewModeForMatch(match: Match, mode: "auto" | ViewMode): ViewMode {
  return resolveViewMode(match, mode);
}

export function groupMatchesByDateAndView(
  entries: [string, Match[]][],
  displayMode: "auto" | ViewMode,
): { date: string; matches: Match[]; viewMode: ViewMode }[] {
  return entries.map(([date, dayMatches]) => {
    const modes = dayMatches.map((m) => resolveViewMode(m, displayMode));
    const viewMode: ViewMode = modes.every((v) => v === "compact")
      ? "compact"
      : modes.every((v) => v === "detailed")
        ? "detailed"
        : "compact";
    return { date, matches: dayMatches, viewMode };
  });
}
