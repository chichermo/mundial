import { getAllZoneTimes, type TimezoneKey } from "@/lib/timezones";

type Props = {
  date: string;
  kickoffEst: string;
  highlight?: TimezoneKey;
};

export function TimezoneStrip({ date, kickoffEst, highlight }: Props) {
  const zones = getAllZoneTimes(date, kickoffEst);

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
      {zones.map((z) => (
        <div
          key={z.key}
          className={`rounded-lg px-1.5 py-2 text-center sm:px-2 ${
            highlight === z.key
              ? "bg-lime/15 ring-1 ring-lime/40"
              : "bg-pitch/60"
          }`}
        >
          <p className="truncate text-[9px] uppercase tracking-wide text-muted sm:text-[10px]">
            {z.flag} {z.label}
          </p>
          <p className="font-display text-base leading-none text-cream sm:text-xl">{z.time}</p>
          <p className="truncate text-[9px] capitalize text-muted sm:text-[10px]">{z.dateLabel}</p>
        </div>
      ))}
    </div>
  );
}
