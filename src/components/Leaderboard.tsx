type Row = {
  id: string;
  name: string;
  matchPts: number;
  knockoutPts: number;
  tournamentPts: number;
  total: number;
  predictions: number;
  maxMatches: number;
};

type Props = {
  rows: Row[];
  highlightId?: string;
};

export function Leaderboard({ rows, highlightId }: Props) {
  return (
    <div className="space-y-3">
      {/* Móvil: tarjetas */}
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row, i) => (
          <li
            key={row.id}
            className={`card-pitch p-4 ${
              row.id === highlightId ? "ring-2 ring-lime/50" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-display text-2xl text-gold">{i + 1}</span>
                <span className="font-medium text-cream">{row.name}</span>
              </div>
              <span className="font-display text-3xl text-lime">{row.total}</span>
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-pitch/60 py-2">
                <dt className="text-muted">Partidos</dt>
                <dd className="font-semibold text-cream">{row.matchPts}</dd>
              </div>
              <div className="rounded-lg bg-pitch/60 py-2">
                <dt className="text-muted">Elim.</dt>
                <dd className="font-semibold text-cream">{row.knockoutPts}</dd>
              </div>
              <div className="rounded-lg bg-pitch/60 py-2">
                <dt className="text-muted">Esp.</dt>
                <dd className="font-semibold text-cream">{row.tournamentPts}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      {/* Desktop: tabla */}
      <div className="card-pitch hidden overflow-x-auto md:block">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-pitch-mid/60 bg-pitch/60 text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Jugador</th>
              <th className="px-4 py-3 text-right">Partidos</th>
              <th className="px-4 py-3 text-right">Elim.</th>
              <th className="px-4 py-3 text-right">Esp.</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-pitch-mid/30 ${
                  row.id === highlightId ? "bg-lime/10" : ""
                }`}
              >
                <td className="px-4 py-3 font-display text-lg text-gold">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3 text-right text-muted">{row.matchPts}</td>
                <td className="px-4 py-3 text-right text-muted">{row.knockoutPts}</td>
                <td className="px-4 py-3 text-right text-muted">{row.tournamentPts}</td>
                <td className="px-4 py-3 text-right font-display text-xl text-lime">
                  {row.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-[10px] text-muted md:text-left">
        Máximo {rows[0]?.maxMatches ?? 0} partidos en la polla
      </p>
    </div>
  );
}
