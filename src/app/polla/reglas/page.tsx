import Link from "next/link";
import { SCORING_RULES } from "@/lib/scoring";

export default function ReglasPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/polla" className="text-sm text-lime hover:underline">
          ← Volver a la polla
        </Link>
        <h1 className="mt-4 font-display text-4xl text-cream">Cómo funciona la polla</h1>
      </div>

      <section className="card-pitch space-y-4 p-6">
        <h2 className="font-display text-xl text-gold">1. Grupo de amigos</h2>
        <p className="text-sm text-muted">
          Uno crea la polla y obtiene un código de 6 caracteres. El resto se une con su apodo.
          Cada persona tiene sus pronósticos; el ranking es común para todo el grupo.
        </p>
      </section>

      <section className="card-pitch space-y-4 p-6">
        <h2 className="font-display text-xl text-gold">2. Fase de grupos (72 partidos)</h2>
        <p className="text-sm text-muted">
          Antes del pitido inicial cargas marcador local–visitante. Cuando el admin publica el
          resultado real, sumas puntos automáticamente:
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            <strong className="text-lime">{SCORING_RULES.exactScore} pts</strong> — marcador exacto
          </li>
          <li>
            <strong className="text-lime">{SCORING_RULES.correctResult} pt</strong> — aciertas
            ganador o empate (aunque no el marcador)
          </li>
          <li>
            <strong className="text-muted">0 pts</strong> — fallas el resultado
          </li>
        </ul>
        <p className="text-xs text-muted">
          Ejemplo: pronosticas 2–1 y termina 2–1 → 3 pts. Pronosticas 2–1 y termina 3–1 → 1 pt
          (ganó el local). Pronosticas 2–1 y termina 1–2 → 0 pts.
        </p>
      </section>

      <section className="card-pitch space-y-4 p-6">
        <h2 className="font-display text-xl text-gold">3. Eliminatoria</h2>
        <p className="text-sm text-muted">
          En cada cruce eliges quién pasa. Si coincide con el ganador real cargado en admin:{" "}
          <strong className="text-lime">+{SCORING_RULES.knockoutWinner} pts</strong>.
        </p>
      </section>

      <section className="card-pitch space-y-4 p-6">
        <h2 className="font-display text-xl text-gold">4. Pronósticos especiales</h2>
        <p className="text-sm text-muted">
          Una sola vez por torneo (campeón, sorpresa, revelación, goleador, jugador revelación).
          El administrador define las respuestas correctas en el panel{" "}
          <Link href="/admin" className="text-lime underline">
            /admin
          </Link>
          :
        </p>
        <ul className="grid grid-cols-2 gap-2 text-sm">
          <li>Campeón — {SCORING_RULES.champion} pts</li>
          <li>Goleador — {SCORING_RULES.topScorer} pts</li>
          <li>Sorpresa — {SCORING_RULES.surprise} pts</li>
          <li>Revelación (selección) — {SCORING_RULES.revelationTeam} pts</li>
          <li>Jugador revelación — {SCORING_RULES.revelationPlayer} pts</li>
        </ul>
      </section>

      <section className="card-pitch space-y-4 p-6">
        <h2 className="font-display text-xl text-gold">5. Ranking</h2>
        <p className="text-sm text-muted">
          Total = puntos partidos + eliminatoria + especiales. Se actualiza al guardar resultados
          en admin.
        </p>
      </section>
    </div>
  );
}
