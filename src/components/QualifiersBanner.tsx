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

  const inZone = (row: (typeof data.rows)[number]) =>
    row.qualified || row.provisionalQualified;

  return (
    <div className="card-pitch border-lime/30 bg-lime/5 p-4">
      <p className="text-xs uppercase tracking-wider text-lime">
        {data.groupStageComplete ? "Clasificados a eliminatoria" : "Ranking en vivo"}
      </p>
      {!data.groupStageComplete && (
        <p className="mt-1 text-xs text-muted">
          Los 4 primeros van a la eliminatoria. Mientras no terminen los 72 partidos de grupos, esa
          zona se marca como <span className="text-gold">en zona</span> (puede cambiar).
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {data.rows.map((row) => (
          <Link
            key={row.id}
            href={`/polla/jugador/${row.id}`}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              inZone(row)
                ? "bg-lime/15 ring-1 ring-lime/30 hover:bg-lime/20"
                : "bg-pitch/60 hover:bg-pitch-mid/60"
            }`}
          >
            <span className="font-display text-gold">{row.rank}.</span> {row.name}
            <span className="ml-1 text-muted">({row.groupPts} pts)</span>
            {row.provisionalQualified && !row.qualified && (
              <span className="ml-1 text-[10px] text-gold">· en zona</span>
            )}
            {row.qualified && (
              <span className="ml-1 text-[10px] text-lime">· clasificado</span>
            )}
          </Link>
        ))}
      </div>
      {data.groupStageComplete && (
        <p className="mt-2 text-xs text-muted">
          Solo los {data.qualifiersCount} clasificados suman puntos en la eliminatoria de la polla.
        </p>
      )}
    </div>
  );
}
