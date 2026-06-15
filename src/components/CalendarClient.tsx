"use client";

import { useEffect, useMemo, useState } from "react";
import { matches, type Match } from "@/lib/matches-data";
import { groupMatchesByDateSorted } from "@/lib/match-order";
import { PageHeader } from "@/components/ui/PageHeader";
import { useFavoriteTeams } from "@/hooks/useFavoriteTeams";
import { groupMatchesByDateAndView, MatchDayBlock } from "./calendar/MatchDayBlock";
import { CalendarFilters, type CalendarFiltersState } from "./CalendarFilters";

const groups = [...new Set(matches.map((m) => m.group).filter(Boolean))] as string[];
const teams = [...new Set(matches.flatMap((m) => [m.home, m.away]))].filter(
  (t) => !t.startsWith("Group") && !t.startsWith("Match"),
).sort();

type DisplayMode = "auto" | "compact" | "detailed";

type ResultRow = { homeScore: number | null; awayScore: number | null };

function filterMatches(
  list: Match[],
  f: CalendarFiltersState,
  favorites: string[],
  favoritesOnly: boolean,
): Match[] {
  const q = f.query.trim().toLowerCase();
  return list.filter((m) => {
    if (f.phase !== "all" && m.phase !== f.phase) return false;
    if (f.group !== "all" && m.group !== f.group) return false;
    if (f.team !== "all" && m.home !== f.team && m.away !== f.team) return false;
    if (favoritesOnly && favorites.length > 0) {
      if (!favorites.includes(m.home) && !favorites.includes(m.away)) return false;
    }
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
  const { favorites, toggle, isFavorite } = useFavoriteTeams();
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [resultsMap, setResultsMap] = useState<Map<number, ResultRow>>(new Map());
  const [filters, setFilters] = useState<CalendarFiltersState>({
    phase: "all",
    group: "all",
    team: "all",
    query: "",
  });
  const [displayMode, setDisplayMode] = useState<DisplayMode>("auto");

  useEffect(() => {
    fetch("/api/matches/results", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { results: { matchId: number; homeScore: number | null; awayScore: number | null }[] }) => {
        setResultsMap(new Map(data.results.map((r) => [r.matchId, r])));
      })
      .catch(() => {});

    const id = setInterval(() => {
      fetch("/api/matches/results", { cache: "no-store" })
        .then((r) => r.json())
        .then((data: { results: { matchId: number; homeScore: number | null; awayScore: number | null }[] }) => {
          setResultsMap(new Map(data.results.map((r) => [r.matchId, r])));
        })
        .catch(() => {});
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#partido-")) {
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  }, []);

  const filtered = useMemo(
    () => filterMatches(matches, filters, favorites, favoritesOnly),
    [filters, favorites, favoritesOnly],
  );

  const days = useMemo(() => {
    const grouped = groupMatchesByDateSorted(filtered);
    const entries = grouped.map((g) => [g.date, g.matches] as [string, Match[]]);
    return groupMatchesByDateAndView(entries, displayMode);
  }, [filtered, displayMode]);

  const compactCount = filtered.filter((m) => m.phase === "group").length;
  const knockoutCount = filtered.length - compactCount;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Fixture completo"
        title="Calendario WE26"
        description="Vista compacta en grupos. Eliminatoria en tarjetas amplias. Enlace directo: /calendario#partido-N"
      />

      <div className="card-pitch p-3 sm:p-4">
        <p className="mb-2 text-xs font-medium text-muted">Mis selecciones favoritas</p>
        <div className="flex flex-wrap gap-1.5">
          {["Chile", "Belgium", "Spain", "Mexico", "Argentina", "Brazil"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggle(t)}
              className={`rounded-lg px-2.5 py-1 text-xs ${
                isFavorite(t) ? "bg-lime/20 text-lime ring-1 ring-lime/40" : "bg-pitch-mid/50 text-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {favorites.length > 0 && (
          <label className="mt-3 flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
              className="rounded"
            />
            Solo partidos con mis favoritos
          </label>
        )}
      </div>

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
              resultsMap={resultsMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}
