import Link from "next/link";
import { TournamentStatusBanner } from "@/components/TournamentStatusBanner";
import { InstallAppButton } from "@/components/InstallAppButton";
import { getPhaseLabel } from "@/lib/matches-data";
import { getNextUpcomingMatch, isKnockoutPhase } from "@/lib/tournament-phase";
import { formatKickoffInZone } from "@/lib/timezones";
import { getPollaSession, getUserSession } from "@/lib/session";

export default async function HomePage() {
  const user = await getUserSession();
  const polla = await getPollaSession();
  const knockout = isKnockoutPhase();
  const nextMatch = getNextUpcomingMatch();
  const nextKickoff = nextMatch
    ? formatKickoffInZone(nextMatch.date, nextMatch.kickoffEst, "America/Santiago")
    : null;

  return (
    <div className="space-y-10 sm:space-y-16">
      <section className="hero-shell relative overflow-hidden px-4 py-10 sm:px-6 sm:py-16 md:px-12 md:py-24">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-lime/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
        <TournamentStatusBanner />
        <p className="mb-3 mt-6 font-display text-sm tracking-[0.35em] text-lime">
          CANADÁ · MÉXICO · USA
        </p>
        <h1 className="font-display text-4xl leading-[0.92] text-cream sm:text-5xl md:text-8xl">
          MUNDIAL
          <br />
          <span className="text-gradient-gold">2026</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:mt-6 sm:text-lg">
          {knockout
            ? "Eliminatoria en marcha. Sigue el cuadro, pronostica los cruces y compite en la polla Balsuos."
            : "Calendario con horarios en Chile, España y Bélgica, TV por país y polla con cuenta propia."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center">
          <Link href={knockout ? "/calendario/eliminatoria" : "/polla"} className="btn-primary w-full sm:w-auto">
            {knockout ? "Cuadro eliminatorio" : "Ver calendario"}
          </Link>
          {user ? (
            <Link href={polla ? "/polla" : "/polla/grupos"} className="btn-ghost w-full sm:w-auto">
              <span className="truncate">
                {polla ? `Polla: ${polla.groupName}` : "Unirme a Balsuos"}
              </span>
            </Link>
          ) : (
            <>
              <Link href="/cuenta/registro" className="btn-primary w-full sm:w-auto">
                Crear cuenta
              </Link>
              <Link href="/cuenta/login" className="btn-ghost w-full sm:w-auto">
                Iniciar sesión
              </Link>
            </>
          )}
          <InstallAppButton className="w-full sm:w-auto" />
        </div>
        <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-pitch-mid/40 pt-10 md:max-w-xl">
          <div>
            <dt className="font-display text-4xl text-lime">{knockout ? "32" : "104"}</dt>
            <dd className="text-xs uppercase tracking-wider text-muted">
              {knockout ? "Partidos restantes" : "Partidos"}
            </dd>
          </div>
          <div>
            <dt className="font-display text-4xl text-lime">{knockout ? "16" : "48"}</dt>
            <dd className="text-xs uppercase tracking-wider text-muted">
              {knockout ? "Dieciseisavos" : "Selecciones"}
            </dd>
          </div>
          <div>
            <dt className="font-display text-4xl text-lime">4</dt>
            <dd className="text-xs uppercase tracking-wider text-muted">
              {knockout ? "Clasifican polla" : "Husos horarios"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="card-pitch card-hover p-6 md:col-span-2">
          <span className="text-2xl" aria-hidden>
            {knockout ? "🏟️" : "📅"}
          </span>
          <h2 className="mt-3 font-display text-2xl text-gold">
            {knockout ? "Cuadro eliminatorio" : "Calendario mundial"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {knockout
              ? "Dieciseisavos, octavos, cuartos y final. Horarios en Chile y transmisión por país."
              : "Filtra por fase, grupo o selección. Horarios 🇨🇱 🇪🇸 🇧🇪 y canales en cada partido."}
          </p>
          <Link href={knockout ? "/calendario/eliminatoria" : "/calendario"} className="btn-ghost mt-6 text-sm">
            {knockout ? "Ver cuadro completo →" : "Explorar partidos →"}
          </Link>
        </article>
        <article className="card-pitch card-hover p-6">
          <span className="text-2xl" aria-hidden>
            🏆
          </span>
          <h2 className="mt-3 font-display text-2xl text-gold">Polla</h2>
          <ol className="mt-3 space-y-2 text-sm text-muted">
            {knockout ? (
              <>
                <li>1. Solo clasificados suman en eliminatoria</li>
                <li>2. Elige ganador de cada cruce (+2 pts)</li>
                <li>3. Sigue el ranking en vivo</li>
              </>
            ) : (
              <>
                <li>1. Crea tu cuenta</li>
                <li>2. Arma un grupo o únete con código</li>
                <li>3. Pronostica y sube en el ranking</li>
              </>
            )}
          </ol>
          <Link
            href={user ? "/polla/grupos" : "/cuenta/registro"}
            className="btn-primary mt-6 w-full text-sm"
          >
            {user ? "Polla Balsuos" : "Empezar gratis"}
          </Link>
        </article>
      </section>

      {nextMatch && (
        <section>
          <h2 className="font-display mb-4 text-lg text-muted">Próximo partido</h2>
          <div className="card-pitch flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-lime">
                #{nextMatch.id} · {getPhaseLabel(nextMatch.phase)}
              </p>
              <p className="font-display text-3xl">
                {nextMatch.home} <span className="text-muted">vs</span> {nextMatch.away}
              </p>
              {nextKickoff && (
                <p className="mt-1 text-sm text-muted">
                  {nextKickoff.dateLabel} · {nextKickoff.time} (Chile)
                </p>
              )}
            </div>
            <Link href={`/calendario#partido-${nextMatch.id}`} className="btn-ghost text-sm">
              Ver en calendario →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
