"use client";

import type { MatchPhase } from "@/lib/matches-data";

export type CalendarFiltersState = {
  phase: MatchPhase | "all";
  group: string | "all";
  team: string | "all";
  query: string;
};

type Props = {
  filters: CalendarFiltersState;
  groups: string[];
  teams: string[];
  onChange: (f: CalendarFiltersState) => void;
};

const phases: { value: CalendarFiltersState["phase"]; label: string }[] = [
  { value: "all", label: "Todas las fases" },
  { value: "group", label: "Grupos" },
  { value: "round32", label: "Dieciseisavos" },
  { value: "round16", label: "Octavos" },
  { value: "quarter", label: "Cuartos" },
  { value: "semi", label: "Semifinales" },
  { value: "third", label: "3.er puesto" },
  { value: "final", label: "Final" },
];

const inputClass =
  "w-full min-h-[44px] rounded-xl border border-pitch-mid bg-pitch px-3 py-2.5 text-base text-cream focus:border-lime/50 focus:ring-2 focus:ring-lime/30 sm:text-sm";

export function CalendarFilters({ filters, groups, teams, onChange }: Props) {
  return (
    <div className="card-pitch grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4 lg:grid-cols-4">
      <label className="block sm:col-span-2 lg:col-span-1">
        <span className="mb-1.5 block text-xs font-medium text-muted">Buscar</span>
        <input
          type="search"
          placeholder="Equipo, sede…"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Fase</span>
        <select
          value={filters.phase}
          onChange={(e) =>
            onChange({ ...filters, phase: e.target.value as CalendarFiltersState["phase"] })
          }
          className={inputClass}
        >
          {phases.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Grupo</span>
        <select
          value={filters.group}
          onChange={(e) => onChange({ ...filters, group: e.target.value })}
          className={inputClass}
        >
          <option value="all">Todos</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              Grupo {g}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Selección</span>
        <select
          value={filters.team}
          onChange={(e) => onChange({ ...filters, team: e.target.value })}
          className={inputClass}
        >
          <option value="all">Todas</option>
          {teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
