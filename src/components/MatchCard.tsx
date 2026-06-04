"use client";

import { useState } from "react";
import type { Match } from "@/lib/matches-data";
import { getPhaseLabel } from "@/lib/matches-data";
import { isMatchLocked } from "@/lib/timezones";
import { BroadcastPanel } from "./BroadcastPanel";
import { TimezoneStrip } from "./TimezoneStrip";

type Props = {
  match: Match;
  prediction?: { homeScore: number; awayScore: number };
  onPredict?: (matchId: number, home: number, away: number) => Promise<void>;
  showPrediction?: boolean;
};

export function MatchCard({ match, prediction, onPredict, showPrediction }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [home, setHome] = useState(prediction?.homeScore ?? 0);
  const [away, setAway] = useState(prediction?.awayScore ?? 0);
  const [saving, setSaving] = useState(false);
  const locked = isMatchLocked(match.date, match.kickoffEst);

  async function save() {
    if (!onPredict || locked) return;
    setSaving(true);
    try {
      await onPredict(match.id, home, away);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="card-pitch overflow-hidden transition-shadow hover:shadow-[0_0_32px_rgba(125,255,79,0.08)]">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between md:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="shrink-0 font-display text-2xl text-lime/80 sm:text-3xl">
            #{match.id}
          </span>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted">
              {match.group ? `Grupo ${match.group}` : getPhaseLabel(match.phase)}
            </p>
            <p className="font-display text-xl leading-tight sm:text-2xl md:text-3xl">
              <span className="block text-cream sm:inline">{match.home}</span>
              <span className="mx-0 block text-center text-muted sm:mx-2 sm:inline">vs</span>
              <span className="block text-cream sm:inline">{match.away}</span>
            </p>
          </div>
        </div>
        <div className="shrink-0 text-left text-xs text-muted sm:text-right">
          <p className="break-words">{match.venue}</p>
          <p>{match.city}</p>
        </div>
      </div>

      <div className="border-t border-pitch-mid/40 px-3 py-3 sm:px-4 md:px-5">
        <TimezoneStrip date={match.date} kickoffEst={match.kickoffEst} />
      </div>

      {showPrediction && onPredict && (
        <div className="flex flex-col gap-3 border-t border-pitch-mid/40 bg-pitch/40 px-3 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-4 md:px-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-full text-sm text-muted sm:w-auto">Tu pronóstico</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={15}
                inputMode="numeric"
                value={home}
                disabled={locked}
                onChange={(e) => setHome(Number(e.target.value))}
                className="h-11 w-14 rounded-lg border border-pitch-mid bg-pitch px-2 text-center text-lg text-cream focus:ring-2 focus:ring-lime"
                aria-label="Goles local"
              />
              <span className="text-muted">-</span>
              <input
                type="number"
                min={0}
                max={15}
                inputMode="numeric"
                value={away}
                disabled={locked}
                onChange={(e) => setAway(Number(e.target.value))}
                className="h-11 w-14 rounded-lg border border-pitch-mid bg-pitch px-2 text-center text-lg text-cream focus:ring-2 focus:ring-lime"
                aria-label="Goles visita"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={locked || saving}
            className="btn-primary w-full text-sm sm:w-auto sm:!min-h-10"
          >
            {locked ? "Cerrado" : saving ? "Guardando…" : "Guardar"}
          </button>
          {prediction && (
            <span className="text-center text-xs text-muted sm:text-left">
              Guardado: {prediction.homeScore}-{prediction.awayScore}
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full min-h-[44px] border-t border-pitch-mid/40 px-3 py-3 text-xs font-medium text-lime active:bg-pitch-mid/40 hover:bg-pitch-mid/30 sm:px-4 md:px-5"
        aria-expanded={expanded}
      >
        {expanded ? "Ocultar transmisión" : "Ver transmisión (CL · ES · BE)"}
      </button>

      {expanded && (
        <div className="px-3 pb-4 sm:px-4 md:px-5">
          <BroadcastPanel broadcast={match.broadcast} />
        </div>
      )}
    </article>
  );
}
