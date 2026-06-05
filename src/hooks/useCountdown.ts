"use client";

import { useEffect, useState } from "react";
import { getKickoffUtc } from "@/lib/timezones";

export function useCountdown(date: string, kickoffEst: string, active = true) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!active) return;
    function tick() {
      const kick = getKickoffUtc(date, kickoffEst).getTime();
      const diff = kick - Date.now();
      if (diff <= 0) {
        setLabel("");
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      if (h > 48) {
        const d = Math.floor(h / 24);
        setLabel(`en ${d}d`);
      } else if (h > 0) {
        setLabel(`en ${h}h ${m}m`);
      } else {
        setLabel(`en ${m}m`);
      }
    }
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [date, kickoffEst, active]);

  return label;
}
