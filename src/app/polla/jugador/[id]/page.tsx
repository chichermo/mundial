"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type PlayerData = {
  name: string;
  rank: number;
  groupPts: number;
  total: number;
  qualified: boolean;
  provisionalQualified: boolean;
  history: {
    matchId: number;
    label: string;
    prediction: string;
    result: string;
    points: number;
  }[];
  achievements: { id: string; label: string; emoji: string; earned: boolean }[];
};

export default function JugadorPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<PlayerData | null>(null);

  useEffect(() => {
    fetch(`/api/polla/member/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData);
  }, [id]);

  if (!data) {
    return <p className="py-12 text-center text-muted">Cargando jugador…</p>;
  }

  return (
    <div className="space-y-6">
      <Link href="/polla" className="text-sm text-lime hover:underline">
        ← Volver a la polla
      </Link>
      <header>
        <h1 className="font-display text-4xl text-cream">{data.name}</h1>
        <p className="text-sm text-muted">
          Puesto #{data.rank} · {data.groupPts} pts grupos · {data.total} total
          {data.qualified && <span className="ml-2 text-lime">Clasificado</span>}
          {data.provisionalQualified && !data.qualified && (
            <span className="ml-2 text-gold">Provisional top 4</span>
          )}
        </p>
      </header>

      <section className="card-pitch p-4">
        <h2 className="font-display text-lg text-gold">Logros</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {data.achievements.map((a) => (
            <li
              key={a.id}
              className={`rounded-lg px-3 py-2 text-sm ${
                a.earned ? "bg-lime/15 text-lime" : "bg-pitch/50 text-muted line-through opacity-50"
              }`}
            >
              {a.emoji} {a.label}
            </li>
          ))}
        </ul>
      </section>

      <section className="card-pitch overflow-x-auto">
        <h2 className="border-b border-pitch-mid/40 p-4 font-display text-lg text-gold">
          Historial de partidos
        </h2>
        <table className="w-full min-w-[400px] text-sm">
          <thead>
            <tr className="text-xs uppercase text-muted">
              <th className="px-4 py-2 text-left">Partido</th>
              <th className="px-4 py-2 text-center">Pronóstico</th>
              <th className="px-4 py-2 text-center">Real</th>
              <th className="px-4 py-2 text-right">Pts</th>
            </tr>
          </thead>
          <tbody>
            {data.history.map((h) => (
              <tr key={h.matchId} className="border-t border-pitch-mid/20">
                <td className="px-4 py-2">{h.label}</td>
                <td className="px-4 py-2 text-center">{h.prediction}</td>
                <td className="px-4 py-2 text-center text-muted">{h.result}</td>
                <td
                  className={`px-4 py-2 text-right font-display ${
                    h.points >= 5 ? "text-lime" : h.points >= 2 ? "text-gold" : "text-muted"
                  }`}
                >
                  {h.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.history.length === 0 && (
          <p className="p-4 text-center text-sm text-muted">Aún no hay partidos con resultado.</p>
        )}
      </section>
    </div>
  );
}
