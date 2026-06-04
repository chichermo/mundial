import type { MatchBroadcast } from "@/lib/matches-data";

type Props = {
  broadcast: MatchBroadcast;
};

function ChannelList({ title, items, accent }: { title: string; items: string[]; accent?: string }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">{title}</p>
      <ul className="flex flex-wrap gap-1">
        {items.map((ch) => (
          <li
            key={ch}
            className={`rounded-md px-2 py-0.5 text-xs ${
              accent ?? "bg-pitch-mid/80 text-cream"
            }`}
          >
            {ch}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BroadcastPanel({ broadcast }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 border-t border-pitch-mid/40 pt-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2">
        <p className="font-display text-sm text-gold">🇨🇱 Chile</p>
        <ChannelList title="Todos los partidos" items={broadcast.chile.all} />
        <ChannelList
          title="TV abierta"
          items={broadcast.chile.freeTv ?? []}
          accent="bg-gold/20 text-gold"
        />
        <ChannelList
          title="Streaming premium"
          items={broadcast.chile.premium ?? []}
          accent="bg-lime/10 text-lime"
        />
      </div>
      <div className="space-y-2">
        <p className="font-display text-sm text-gold">🇪🇸 España</p>
        <ChannelList title="Pack completo (104)" items={broadcast.spain.all} />
        <ChannelList
          title="Gratis (RTVE)"
          items={broadcast.spain.freeTv ?? []}
          accent="bg-gold/20 text-gold"
        />
      </div>
      <div className="space-y-2">
        <p className="font-display text-sm text-gold">🇧🇪 Bélgica</p>
        <ChannelList title="TV" items={broadcast.belgium.all} />
        <ChannelList title="Streaming" items={broadcast.belgium.stream ?? []} />
        <p className="text-[10px] text-muted">Cobertura completa en servicio público (VRT/RTBF).</p>
      </div>
    </div>
  );
}
