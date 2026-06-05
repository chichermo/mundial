import { getMatch } from "@/lib/matches-data";
import { prisma } from "@/lib/prisma";

export async function getFeaturedMatch() {
  try {
    const config = await prisma.appConfig.findUnique({ where: { id: "global" } });
    if (!config?.featuredMatchId) return null;
    const match = getMatch(config.featuredMatchId);
    if (!match) return null;
    return {
      match,
      multiplier: config.featuredMultiplier ?? 2,
    };
  } catch {
    return null;
  }
}

export async function setFeaturedMatch(matchId: number | null, multiplier = 2) {
  await prisma.appConfig.upsert({
    where: { id: "global" },
    create: { id: "global", featuredMatchId: matchId, featuredMultiplier: multiplier },
    update: { featuredMatchId: matchId, featuredMultiplier: multiplier },
  });
}
