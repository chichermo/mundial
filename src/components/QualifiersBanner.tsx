"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LiveStandings } from "@/lib/groups";

export function QualifiersBanner() {
  const [data, setData] = useState<LiveStandings | null>(null);

  useEffect(() => {
    fetch("/api/polla/leaderboard")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  const qualifiers = data.rows.filter((r) => r.qualified || r.provisionalQualified).slice(0, 4);

  return (
    <div className="card-pitch border-lime/30 bg-lime/5 p-4">
      <p className="text-xs uppercase tracking-wider text-lime">
        {data.groupStageComplete ? "Clasificados a eliminatoria" : "Provisional — top 4"}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {qualifiers.map((q, i) => (
          <Link
            key={q.id}
            href={`/polla/jugador/${q.id}`}
            className="rounded-lg bg-pitch/60 px-3 py-1.5 text-sm transition-colors hover:bg-pitch-mid/60"
          >
            <span className="font-display text-gold">{i + 1}.</span> {q.name}
            <span className="ml-1 text-muted">({q.groupPts} pts)</span>
          </Link>
        ))}
      </div>
      {data.groupStageComplete && (
        <p className="mt-2 text-xs text-muted">
          Solo estos 4 suman puntos en la eliminatoria de la polla.
        </p>
      )}
    </div>
  );
}
