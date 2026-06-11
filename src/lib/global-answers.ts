import { prisma } from "@/lib/prisma";

export type TournamentAnswers = {
  champion: string | null;
  surprise: string | null;
  revelationTeam: string | null;
  topScorer: string | null;
  revelationPlayer: string | null;
};

export async function getTournamentAnswers(): Promise<TournamentAnswers> {
  try {
    const row = await prisma.globalAnswers.findUnique({ where: { id: "global" } });
    if (row) {
      return {
        champion: row.champion,
        surprise: row.surprise,
        revelationTeam: row.revelationTeam,
        topScorer: row.topScorer,
        revelationPlayer: row.revelationPlayer,
      };
    }
  } catch (err) {
    console.error("[global-answers]", err);
  }
  return {
    champion: process.env.POLLA_CHAMPION ?? null,
    surprise: process.env.POLLA_SURPRISE ?? null,
    revelationTeam: process.env.POLLA_REVELATION_TEAM ?? null,
    topScorer: process.env.POLLA_TOP_SCORER ?? null,
    revelationPlayer: process.env.POLLA_REVELATION_PLAYER ?? null,
  };
}
