"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { matches, teams, getPhaseLabel } from "@/lib/matches-data";
import type { MatchPhase } from "@/lib/matches-data";

type ResultRow = {
  matchId: number;
  homeScore: number | null;
  awayScore: number | null;
  winnerLabel: string | null;
};

type Props = {
  results: ResultRow[];
  tournament: {
    champion: string | null;
    surprise: string | null;
    revelationTeam: string | null;
    topScorer: string | null;
    revelationPlayer: string | null;
  };
};

export function AdminPanel({ results, tournament }: Props) {
  const router = useRouter();
  const resultMap = useMemo(
    () => new Map(results.map((r) => [r.matchId, r])),
    [results],
  );
  const [phase, setPhase] = useState<MatchPhase | "all">("all");
  const [status, setStatus] = useState("");
  const [tForm, setTForm] = useState(tournament);

  const filtered = matches.filter((m) => phase === "all" || m.phase === phase);

  async function saveMatch(
    matchId: number,
    home: string,
    away: string,
    isKnockout: boolean,
  ) {
    const homeIn = document.getElementById(`h-${matchId}`) as HTMLInputElement;
    const awayIn = document.getElementById(`a-${matchId}`) as HTMLInputElement;
    const winIn = document.getElementById(`w-${matchId}`) as HTMLSelectElement;

    const homeScore = homeIn.value === "" ? null : Number(homeIn.value);
    const awayScore = awayIn.value === "" ? null : Number(awayIn.value);
    const winnerLabel = isKnockout && winIn.value ? winIn.value : null;

    const res = await fetch("/api/admin/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore, awayScore, winnerLabel }),
    });
    setStatus(res.ok ? `Guardado #${matchId}` : "Error al guardar");
    router.refresh();
  }

  async function saveTournament(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/tournament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tForm),
    });
    setStatus(res.ok ? "Respuestas especiales guardadas" : "Error");
    router.refresh();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-cream">Panel de resultados</h1>
        <button type="button" onClick={logout} className="btn-ghost text-sm">
          Cerrar sesión admin
        </button>
      </div>

      {status && <p className="text-sm text-lime">{status}</p>}

      <form onSubmit={saveTournament} className="card-pitch grid gap-4 p-6 md:grid-cols-2">
        <h2 className="font-display text-xl text-gold md:col-span-2">
          Respuestas correctas (polla especial)
        </h2>
        {(
          [
            ["champion", "Campeón"],
            ["surprise", "Selección sorpresa"],
            ["revelationTeam", "Selección revelación"],
            ["topScorer", "Goleador"],
            ["revelationPlayer", "Jugador revelación"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block">
            <span className="mb-1 block text-xs text-muted">{label}</span>
            {key === "topScorer" || key === "revelationPlayer" ? (
              <input
                value={tForm[key] ?? ""}
                onChange={(e) => setTForm({ ...tForm, [key]: e.target.value })}
                className="w-full rounded-lg border border-pitch-mid bg-pitch px-3 py-2 text-sm text-cream"
              />
            ) : (
              <select
                value={tForm[key] ?? ""}
                onChange={(e) => setTForm({ ...tForm, [key]: e.target.value })}
                className="w-full rounded-lg border border-pitch-mid bg-pitch px-3 py-2 text-sm text-cream"
              >
                <option value="">—</option>
                {teams.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </label>
        ))}
        <button type="submit" className="btn-primary md:col-span-2">
          Guardar respuestas especiales
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {(["all", "group", "round32", "round16", "quarter", "semi", "third", "final"] as const).map(
          (p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPhase(p)}
              className={`rounded-lg px-3 py-1 text-sm ${
                phase === p ? "bg-lime text-ink" : "bg-pitch-mid/50 text-muted"
              }`}
            >
              {p === "all" ? "Todos" : getPhaseLabel(p as MatchPhase)}
            </button>
          ),
        )}
      </div>

      <div className="space-y-3">
        {filtered.map((m) => {
          const r = resultMap.get(m.id);
          const isKnockout = m.phase !== "group";
          return (
            <div key={m.id} className="card-pitch flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center">
              <span className="font-display text-lime">#{m.id}</span>
              <span className="min-w-0 flex-1 text-sm leading-snug">
                {m.home} vs {m.away}
              </span>
              <div className="flex flex-wrap items-center gap-2">
              <input
                id={`h-${m.id}`}
                type="number"
                min={0}
                defaultValue={r?.homeScore ?? ""}
                placeholder="L"
                className="w-14 rounded border border-pitch-mid bg-pitch px-2 py-1 text-center text-sm"
              />
              <span className="text-muted">-</span>
              <input
                id={`a-${m.id}`}
                type="number"
                min={0}
                defaultValue={r?.awayScore ?? ""}
                placeholder="V"
                className="w-14 rounded border border-pitch-mid bg-pitch px-2 py-1 text-center text-sm"
              />
              {isKnockout && (
                <select
                  id={`w-${m.id}`}
                  defaultValue={r?.winnerLabel ?? ""}
                  className="rounded border border-pitch-mid bg-pitch px-2 py-1 text-sm text-cream"
                >
                  <option value="">Ganador</option>
                  <option value={m.home}>{m.home}</option>
                  <option value={m.away}>{m.away}</option>
                </select>
              )}
              <button
                type="button"
                onClick={() => saveMatch(m.id, m.home, m.away, isKnockout)}
                className="btn-primary w-full !min-h-10 text-xs sm:w-auto sm:!min-h-9 sm:!px-3"
              >
                Guardar
              </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
