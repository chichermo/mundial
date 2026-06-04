"use client";

import { useState } from "react";
import type { Match } from "@/lib/matches-data";
import { getPhaseLabel } from "@/lib/matches-data";
import { BroadcastPanel } from "@/components/BroadcastPanel";
import { formatKickoff } from "@/lib/timezones";

type Props = {
  match: Match;
};

export function MatchListRow({ match }: Props) {
  const [open, setOpen] = useState(false);
  const cl = formatKickoff(match.date, match.kickoffEst, "chile");
  const hasFreeTv = (match.broadcast.chile.freeTv?.length ?? 0) > 0;
  const phaseLabel = match.group ? `G${match.group}` : getPhaseLabel(match.phase);

  return (
    <article className="border-b border-pitch-mid/30 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-3 text-left transition-colors active:bg-pitch-mid/40 hover:bg-pitch-mid/30 sm:px-4"
      >
        {/* Móvil: dos filas */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-muted">#{match.id}</span>
            <span className="font-display text-xl text-lime">{cl.time}</span>
            <span className="rounded bg-pitch-mid/80 px-1.5 py-0.5 text-[10px] uppercase text-muted">
              {phaseLabel}
            </span>
            <span className="text-muted" aria-hidden>
              {open ? "▲" : "▼"}
            </span>
          </div>
          <p className="text-sm leading-snug">
            <span className="font-medium text-cream">{match.home}</span>
            <span className="mx-1.5 text-muted">vs</span>
            <span className="font-medium text-cream">{match.away}</span>
          </p>
        </div>

        {/* Tablet+ */}
        <div className="hidden w-full grid-cols-[2.5rem_3.5rem_1fr_auto_auto] items-center gap-2 sm:grid md:grid-cols-[2.5rem_4rem_1fr_5rem_auto]">
          <span className="font-mono text-xs text-muted">#{match.id}</span>
          <span className="font-display text-lg leading-none text-lime">{cl.time}</span>
          <span className="min-w-0 text-sm sm:truncate">
            <span className="text-cream">{match.home}</span>
            <span className="mx-1 text-muted">vs</span>
            <span className="text-cream">{match.away}</span>
          </span>
          <span className="text-[10px] uppercase text-muted">{phaseLabel}</span>
          <span className="text-[10px] text-muted">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-pitch-mid/20 bg-pitch/50 px-3 py-3 text-xs sm:px-4">
          <p className="break-words text-muted">
            {match.venue} · {match.city} · {cl.dateLabel}
          </p>
          {hasFreeTv && (
            <p className="mt-1 break-words text-gold">
              TV abierta CL: {match.broadcast.chile.freeTv?.join(", ")}
            </p>
          )}
          <BroadcastPanel broadcast={match.broadcast} />
        </div>
      )}
    </article>
  );
}
