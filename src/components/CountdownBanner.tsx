function daysUntil(target: Date): number {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function CountdownBanner() {
  const kickoff = new Date("2026-06-11T19:00:00Z");
  const days = daysUntil(kickoff);

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
