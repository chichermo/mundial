"use client";

import { useState } from "react";
import { teams } from "@/lib/matches-data";

type Initial = {
  champion?: string | null;
  surprise?: string | null;
  revelationTeam?: string | null;
  topScorer?: string | null;
  revelationPlayer?: string | null;
};

type Props = {
  initial: Initial;
};

export function TournamentPicksForm({ initial }: Props) {
  const [form, setForm] = useState({
    champion: initial.champion ?? "",
    surprise: initial.surprise ?? "",
    revelationTeam: initial.revelationTeam ?? "",
    topScorer: initial.topScorer ?? "",
    revelationPlayer: initial.revelationPlayer ?? "",
  });
  const [status, setStatus] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Guardando…");
    const res = await fetch("/api/polla/tournament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "Guardado ✓" : "Error al guardar");
  }

  const fields = [
    { key: "champion" as const, label: "Campeón del Mundial", type: "team" },
    { key: "surprise" as const, label: "Selección sorpresa (rinde más de lo esperado)", type: "team" },
    { key: "revelationTeam" as const, label: "Selección revelación", type: "team" },
    { key: "topScorer" as const, label: "Goleador del torneo", type: "text" },
    { key: "revelationPlayer" as const, label: "Jugador revelación", type: "text" },
  ];

  return (
    <form onSubmit={save} className="card-pitch space-y-4 p-6">
      <h3 className="font-display text-xl text-gold">Pronósticos especiales</h3>
      <p className="text-xs text-muted">
        Se bloquean al inicio del torneo (11 jun 2026). El admin del grupo define las respuestas
        correctas para sumar puntos.
      </p>
      {fields.map((f) => (
        <label key={f.key} className="block">
          <span className="mb-1 block text-xs text-muted">{f.label}</span>
          {f.type === "team" ? (
            <select
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full rounded-lg border border-pitch-mid bg-pitch px-3 py-2 text-sm text-cream"
            >
              <option value="">— Elegir —</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full rounded-lg border border-pitch-mid bg-pitch px-3 py-2 text-sm text-cream"
              placeholder="Nombre del jugador"
            />
          )}
        </label>
      ))}
      <div className="flex items-center gap-4">
        <button type="submit" className="btn-primary text-sm">
          Guardar especiales
        </button>
        {status && <span className="text-xs text-muted">{status}</span>}
      </div>
    </form>
  );
}
