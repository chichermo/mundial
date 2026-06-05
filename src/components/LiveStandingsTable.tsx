"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExportRankingButton } from "@/components/ExportRankingButton";
import type { LiveStandings } from "@/lib/groups";

type Props = {
  highlightId?: string;
  compact?: boolean;
};

function ptsClass(pts: number) {
  if (pts >= 5) return "text-lime font-semibold";
  if (pts >= 2) return "text-gold";
  return "text-muted";
}

export function LiveStandingsTable({ highlightId, compact = false }: Props) {
  const [data, setData] = useState<LiveStandings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/polla/leaderboard", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar el ranking");
      const json = (await res.json()) as LiveStandings;
      setData(json);
      setError("");
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 12_000);
    return () => clearInterval(id);
  }, [fetchData]);

  if (loading && !data) {
    return (
      <div className="card-pitch animate-pulse p-6 text-center text-sm text-muted">
        Cargando tabla en vivo…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="card-pitch p-6 text-center text-sm text-red-400">
        {error}
        <button type="button" onClick={fetchData} className="btn-ghost ml-2 text-xs">
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  const showMatrix = !compact && data.finishedMatches.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-cream">Tabla en vivo</h2>
          <p className="text-xs text-muted">
            {data.memberCount}/{data.maxMembers} jugadores · Top {data.qualifiersCount} clasifican a
            eliminatoria
            {data.groupStageComplete ? " · Fase de grupos cerrada" : " · Fase de grupos en curso"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportRankingButton targetId="live-standings-export" />
        </div>
        <p className="text-[10px] text-muted sm:col-span-2">
          Actualiza cada 12 s
          {lastRefresh && (
            <>
              {" "}
              · Última:{" "}
              {lastRefresh.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </>
          )}
        </p>
      </div>

      {/* Ranking */}
      <div id="live-standings-export" className="card-pitch overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-pitch-mid/60 bg-pitch/60 text-xs uppercase tracking-wider text-muted">
              <th className="px-3 py-2.5">#</th>
              <th className="px-3 py-2.5">Jugador</th>
              <th className="px-3 py-2.5 text-right">Grupos</th>
              {!compact && <th className="hidden px-3 py-2.5 text-right sm:table-cell">Elim.</th>}
              <th className="px-3 py-2.5 text-right">Total</th>
              <th className="px-3 py-2.5 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-pitch-mid/30 ${
                  row.id === highlightId ? "bg-lime/10" : ""
                }`}
              >
                <td className="px-3 py-2.5 font-display text-lg text-gold">{row.rank}</td>
                <td className="px-3 py-2.5 font-medium text-cream">
                  <Link href={`/polla/jugador/${row.id}`} className="hover:text-lime hover:underline">
                    {row.name}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{row.groupPts}</td>
                {!compact && (
                  <td className="hidden px-3 py-2.5 text-right tabular-nums text-muted sm:table-cell">
                    {row.knockoutPts}
                  </td>
                )}
                <td className="px-3 py-2.5 text-right font-display text-xl tabular-nums text-lime">
                  {row.total}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {row.qualified ? (
                    <span className="rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-medium text-lime">
                      Clasificado
                    </span>
                  ) : row.provisionalQualified ? (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold">
                      Provisional
                    </span>
                  ) : data.groupStageComplete ? (
                    <span className="text-[10px] text-muted">Fuera</span>
                  ) : (
                    <span className="text-[10px] text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Matriz partidos terminados */}
      {showMatrix && (
        <div className="card-pitch overflow-x-auto">
          <p className="border-b border-pitch-mid/40 px-3 py-2 text-xs text-muted">
            Puntos por partido (5 = exacto · 2 = L/E/V · 0 = fallo)
          </p>
          <table className="w-full text-left text-[10px] sm:text-xs">
            <thead>
              <tr className="border-b border-pitch-mid/60 bg-pitch/60 text-muted">
                <th className="sticky left-0 z-10 bg-pitch/95 px-2 py-2">Jugador</th>
                {data.finishedMatches.map((m) => (
                  <th key={m.id} className="min-w-[3.25rem] px-1 py-2 text-center" title={`${m.home} vs ${m.away} (${m.result})`}>
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.id} className="border-b border-pitch-mid/20">
                  <td className="sticky left-0 z-10 max-w-[5rem] truncate bg-pitch-light/95 px-2 py-1.5 font-medium text-cream">
                    <Link href={`/polla/jugador/${row.id}`} className="hover:text-lime">
                      {row.name}
                    </Link>
                  </td>
                  {row.matchCells.map((cell) => (
                    <td
                      key={cell.matchId}
                      className={`px-1 py-1.5 text-center tabular-nums ${ptsClass(cell.points)}`}
                      title={
                        cell.prediction
                          ? `Pronóstico ${cell.prediction} · Real ${cell.result ?? "?"}`
                          : "Sin pronóstico"
                      }
                    >
                      {cell.points > 0 ? cell.points : cell.prediction ? "0" : "·"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[10px] text-muted">
        Marcador exacto: <strong className="text-lime">5 pts</strong> · Resultado L/E/V:{" "}
        <strong className="text-gold">2 pts</strong> · Los {data.qualifiersCount} mejores en fase
        de grupos pasan a la eliminatoria.
      </p>
    </div>
  );
}
