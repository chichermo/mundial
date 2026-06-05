"use client";

import { useEffect, useState } from "react";

type Props = { matchId: number };

export function MatchCompare({ matchId }: Props) {
  const [data, setData] = useState<{
    locked: boolean;
    result: string | null;
    predictions: { name: string; prediction: string | null }[];
  } | null>(null);

  useEffect(() => {
    fetch(`/api/polla/compare?matchId=${matchId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [matchId]);

  if (!data) return null;

  return (
    <div className="mt-3 border-t border-pitch-mid/30 pt-3">
      <p className="text-[10px] uppercase tracking-wider text-muted">
        Pronósticos del grupo {data.result && `· Resultado ${data.result}`}
      </p>
      <ul className="mt-2 grid grid-cols-2 gap-1 text-xs sm:grid-cols-4">
        {data.predictions.map((p) => (
          <li key={p.name} className="rounded-lg bg-pitch/50 px-2 py-1.5">
            <span className="block truncate font-medium text-cream">{p.name}</span>
            <span className="text-muted">{p.prediction ?? "—"}</span>
          </li>
        ))}
      </ul>
      {!data.locked && (
        <p className="mt-1 text-[10px] text-gold">Los pronósticos se revelan al iniciar el partido.</p>
      )}
    </div>
  );
}
