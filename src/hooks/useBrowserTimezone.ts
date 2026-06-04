"use client";

import { useEffect, useState } from "react";
import {
  formatKickoffInZone,
  resolveBrowserTimezone,
  type ResolvedTimezone,
} from "@/lib/timezones";

let cachedZone: ResolvedTimezone | null = null;

export function useBrowserTimezone(): ResolvedTimezone | null {
  const [zone, setZone] = useState<ResolvedTimezone | null>(cachedZone);

  useEffect(() => {
    if (cachedZone) {
      setZone(cachedZone);
      return;
    }
    try {
      const iana = Intl.DateTimeFormat().resolvedOptions().timeZone;
      cachedZone = resolveBrowserTimezone(iana);
    } catch {
      cachedZone = resolveBrowserTimezone("America/Santiago");
    }
    setZone(cachedZone);
  }, []);

  return zone;
}

export function useKickoffForBrowser(date: string, kickoffEst: string) {
  const zone = useBrowserTimezone();
  if (!zone) return null;
  return {
    zone,
    ...formatKickoffInZone(date, kickoffEst, zone.tz),
  };
}
