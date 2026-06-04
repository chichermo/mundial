import { ProgressRing } from "@/components/ui/ProgressRing";

type Progress = {
  group: { done: number; total: number; pct: number };
  knockout: { done: number; total: number; pct: number };
  specials: { done: number; total: number };
  overallPct: number;
};

export function PollaProgressCard({ progress }: { progress: Progress }) {
  return (
    <div className="card-pitch flex flex-col items-center gap-6 p-4 sm:p-6 md:grid md:grid-cols-[auto_1fr] md:items-center">
      <ProgressRing pct={progress.overallPct} size={64} />
      <div className="grid w-full grid-cols-1 gap-4 min-[380px]:grid-cols-3">
        <Stat
          label="Fase grupos"
          done={progress.group.done}
          total={progress.group.total}
          pct={progress.group.pct}
        />
        <Stat
          label="Eliminatoria"
          done={progress.knockout.done}
          total={progress.knockout.total}
          pct={progress.knockout.pct}
        />
        <Stat
          label="Especiales"
          done={progress.specials.done}
          total={progress.specials.total}
          pct={progress.specials.done ? 100 : 0}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  done,
  total,
  pct,
}: {
  label: string;
  done: number;
  total: number;
  pct: number;
}) {
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="text-lime">
          {done}/{total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-pitch-mid">
        <div
          className="h-full rounded-full bg-lime transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
