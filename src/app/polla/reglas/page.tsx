import Link from "next/link";
import { POLL_CONFIG } from "@/lib/poll-config";
import { SCORING_RULES } from "@/lib/scoring";

export default function ReglasPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/polla" className="text-sm text-lime hover:underline">
          ← Volver a la polla
        </Link>
        <h1 className="mt-4 font-display text-4xl text-cream">Reglas Balsuos</h1>
      </div>

      <section className="card-pitch space-y-4 p-6">
        <h2 className="font-display text-xl text-gold">1. El grupo</h2>
        <p className="text-sm text-muted">
          Somos <strong className="text-cream">{POLL_CONFIG.maxMembers} jugadores</strong> en la
          polla. Todos pronostican la fase de grupos del Mundial (72 partidos). Al terminar esa
          fase, los <strong className="text-lime">{POLL_CONFIG.qualifiersCount} con más puntos</strong>{" "}
          siguen compitiendo en la eliminatoria.
        </p>
      </section>

      <section className="card-pitch space-y-4 p-6">
        <h2 className="font-display text-xl text-gold">2. Puntos por partido (fase de grupos)</h2>
        <p className="text-sm text-muted">
          Antes del pitido cargas el marcador. Cuando el admin publica el resultado real:
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            <strong className="text-lime">{SCORING_RULES.exactScore} pts</strong> — marcador exacto
            (ej. 2-0, 1-1)
          </li>
          <li>
            <strong className="text-gold">{SCORING_RULES.correctResult} pts</strong> — aciertas el
            resultado L/E/V (local gana, empate o visitante gana)
          </li>
          <li>
            <strong className="text-muted">0 pts</strong> — fallas el resultado
          </li>
        </ul>
        <p className="text-xs text-muted">
          Ejemplo: pronosticas 2-1 y termina 2-1 → 5 pts. Pronosticas 2-1 y termina 3-1 → 2 pts
          (ganó el local). Pronosticas 2-1 y termina 1-2 → 0 pts.
        </p>
      </section>

      <section className="card-pitch space-y-4 p-6">
        <h2 className="font-display text-xl text-gold">3. Eliminatoria</h2>
        <p className="text-sm text-muted">
          Solo los {POLL_CONFIG.qualifiersCount} clasificados suman puntos en cruces de eliminatoria.
          Aciertas al ganador del partido:{" "}
          <strong className="text-lime">+{SCORING_RULES.knockoutWinner} pts</strong>.
        </p>
      </section>

      <section className="card-pitch space-y-4 p-6">
        <h2 className="font-display text-xl text-gold">4. Tabla en vivo</h2>
        <p className="text-sm text-muted">
          En la polla verás una tabla que se actualiza sola cada pocos segundos con el ranking y los
          puntos de cada partido ya jugado. No hace falta recargar la página.
        </p>
      </section>

      <section className="card-pitch space-y-4 p-6">
        <h2 className="font-display text-xl text-gold">5. Pronósticos especiales</h2>
        <p className="text-sm text-muted">
          Opcionales, pero suman al total. Se cierran al <strong className="text-cream">primer pitido</strong>{" "}
          del Mundial (11 jun 2026). El admin publica las respuestas correctas en{" "}
          <Link href="/admin" className="text-lime underline">
            /admin
          </Link>
          .
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            <strong className="text-lime">+{SCORING_RULES.champion} pts</strong> — campeón
          </li>
          <li>
            <strong className="text-lime">+{SCORING_RULES.topScorer} pts</strong> — goleador del torneo
          </li>
          <li>
            <strong className="text-gold">+{SCORING_RULES.surprise} pts</strong> — selección sorpresa
          </li>
          <li>
            <strong className="text-gold">+{SCORING_RULES.revelationTeam} pts</strong> — selección revelación
          </li>
          <li>
            <strong className="text-gold">+{SCORING_RULES.revelationPlayer} pts</strong> — jugador revelación
          </li>
        </ul>
      </section>
    </div>
  );
}
