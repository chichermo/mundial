import { getPhaseHeadline, getTournamentPhase } from "@/lib/tournament-phase";

export function TournamentStatusBanner() {
  const phase = getTournamentPhase();
  const headline = getPhaseHeadline(phase);

  if (phase === "pre") {
    const kickoff = new Date("2026-06-11T19:00:00Z");
    const days = Math.max(
      0,
      Math.ceil((kickoff.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-4 py-1.5 text-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
        </span>
        <span className="text-cream">
          Faltan <strong className="font-display text-lg text-lime">{days}</strong> días para el
          arranque
        </span>
      </div>
    );
  }

  const tone =
    phase === "group"
      ? "border-lime/30 bg-lime/10"
      : phase === "finished"
        ? "border-pitch-mid/50 bg-pitch-mid/30"
        : "border-gold/40 bg-gold/10";

  const dot =
    phase === "finished" ? "bg-muted" : phase === "group" ? "bg-lime" : "bg-gold";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm ${tone}`}
    >
      <span className={`inline-flex h-2 w-2 rounded-full ${dot}`} />
      <span className="text-cream">
        <strong className="font-display text-base text-gold">{headline}</strong>
        {phase === "round32" && (
          <span className="ml-1 text-muted">· 16 partidos · 28 jun – 3 jul</span>
        )}
      </span>
    </div>
  );
}
