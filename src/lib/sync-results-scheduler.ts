import { syncResultsFromApiFootball } from "@/lib/api-football-sync";
import { syncResultsFromOpenFootball } from "@/lib/openfootball-sync";
import { prisma } from "@/lib/prisma";

const SYNC_ACTIONS = ["openfootball_sync", "api_sync"] as const;
const STALE_MS = 10 * 60 * 1000;

let inflight: Promise<void> | null = null;

async function isStale(): Promise<boolean> {
  const last = await prisma.adminChangeLog.findFirst({
    where: { action: { in: [...SYNC_ACTIONS] } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (!last) return true;
  return Date.now() - last.createdAt.getTime() > STALE_MS;
}

async function runSync(): Promise<void> {
  await syncResultsFromOpenFootball();
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (apiKey) {
    await syncResultsFromApiFootball(apiKey);
  }
}

/** Sincroniza resultados externos si pasaron >10 min desde la última sync exitosa. */
export async function syncResultsIfStale(): Promise<void> {
  if (!(await isStale())) return;

  if (!inflight) {
    inflight = runSync()
      .catch((err) => {
        console.error("[sync-results]", err);
      })
      .finally(() => {
        inflight = null;
      });
  }

  await inflight;
}

/** Fuerza sincronización (cron / admin). */
export async function syncResultsNow(): Promise<void> {
  if (!inflight) {
    inflight = runSync().finally(() => {
      inflight = null;
    });
  }
  await inflight;
}
