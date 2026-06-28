import { getFeaturedMatch } from "@/lib/app-config";
import { isKnockoutPhase } from "@/lib/tournament-phase";

export async function FeaturedMatchBanner() {
  if (isKnockoutPhase()) return null;

  const featured = await getFeaturedMatch();
  if (!featured) return null;

  const { match, multiplier } = featured;
  return (
    <div className="card-pitch border-gold/40 bg-gradient-to-r from-gold/10 to-lime/5 p-4">
      <p className="text-xs uppercase tracking-wider text-gold">Partido del día · puntos x{multiplier}</p>
      <p className="mt-1 font-display text-xl text-cream">
        #{match.id} {match.home} vs {match.away}
      </p>
      <p className="text-xs text-muted">
        Si aciertas marcador exacto en este partido, los puntos se multiplican (solo fase grupos).
      </p>
    </div>
  );
}
