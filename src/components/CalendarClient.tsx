"use client";

import { useMemo, useState } from "react";
import { matches, type Match } from "@/lib/matches-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { groupMatchesByDateAndView, MatchDayBlock } from "./calendar/MatchDayBlock";
import { CalendarFilters, type CalendarFiltersState } from "./CalendarFilters";

const groups = [...new Set(matches.map((m) => m.group).filter(Boolean))] as string[];
const teams = [...new Set(matches.flatMap((m) => [m.home, m.away]))].filter(
  (t) => !t.startsWith("Group") && !t.startsWith("Match"),
).sort();

type DisplayMode = "auto" | "compact" | "detailed";

function filterMatches(list: Match[], f: CalendarFiltersState): Match[] {
  const q = f.query.trim().toLowerCase();
  return list.filter((m) => {
    if (f.phase !== "all" && m.phase !== f.phase) return false;
    if (f.group !== "all" && m.group !== f.group) return false;
    if (f.team !== "all" && m.home !== f.team && m.away !== f.team) return false;
    if (q) {
      const blob = `${m.home} ${m.away} ${m.venue} ${m.city} ${m.group ?? ""}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  });
}

const modeLabels: Record<DisplayMode, string> = {
  auto: "Auto",
  compact: "Lista",
  detailed: "Tarjetas",
};

export function CalendarClient() {
  const [filters, setFilters] = useState<CalendarFiltersState>({
    phase: "all",
    group: "all",
    team: "all",
    query: "",
  });
  const [displayMode, setDisplayMode] = useState<DisplayMode>("auto");

  const filtered = useMemo(() => filterMatches(matches, filters), [filters]);

  const days = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of filtered) {
      const arr = map.get(m.date) ?? [];
      arr.push(m);
      map.set(m.date, arr);
    }
    const entries = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    return groupMatchesByDateAndView(entries, displayMode);
  }, [filtered, displayMode]);

  const compactCount = filtered.filter((m) => m.phase === "group").length;
  const knockoutCount = filtered.length - compactCount;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Fixture completo"
        title="Calendario WE26"
        description="Vista compacta en grupos. Eliminatoria en tarjetas amplias."
      />

      <CalendarFilters filters={filters} groups={groups} teams={teams} onChange={setFilters} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted sm:text-sm">
          <strong className="text-lime">{filtered.length}</strong> partidos
          {displayMode === "auto" && (
            <span className="mt-0.5 block sm:ml-2 sm:mt-0 sm:inline">
              · {compactCount} lista · {knockoutCount} tarjetas
            </span>
          )}
        </p>
        <div
          className="flex w-full rounded-lg bg-pitch-light p-0.5 sm:w-auto"
          role="group"
          aria-label="Modo de vista"
        >
          {(["auto", "compact", "detailed"] as DisplayMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setDisplayMode(mode)}
              className={`min-h-[40px] flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors sm:flex-none sm:px-3 ${
                displayMode === mode ? "bg-lime text-ink" : "text-muted hover:text-cream"
              }`}
            >
              {modeLabels[mode]}
            </button>
          ))}
        </div>
      </div>

      {days.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No hay partidos con esos filtros.</p>
      ) : (
        <div className={displayMode === "compact" ? "space-y-2" : "space-y-6 sm:space-y-8"}>
          {days.map((day) => (
            <MatchDayBlock
              key={day.date}
              date={day.date}
              matches={day.matches}
              viewMode={day.viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
