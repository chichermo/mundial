"use client";

import { MobileBottomNav } from "./MobileBottomNav";
import { PredictionReminders } from "./PredictionReminders";
import { PwaInstall } from "./PwaInstall";

export function ClientProviders() {
  return (
    <>
      <PredictionReminders />
      <PwaInstall />
      <MobileBottomNav />
    </>
  );
}
