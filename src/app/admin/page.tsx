import { AdminLogin } from "@/components/AdminLogin";
import { AdminPanel } from "@/components/AdminPanel";
import { isAdmin } from "@/lib/admin-auth";
import { getTournamentAnswers } from "@/lib/global-answers";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const admin = await isAdmin();

  if (!admin) {
    return (
      <div className="space-y-6 py-8">
        <AdminLogin />
      </div>
    );
  }

  const results = await prisma.matchResult.findMany();
  const tournament = await getTournamentAnswers();

  return (
    <AdminPanel
      results={results.map((r) => ({
        matchId: r.matchId,
        homeScore: r.homeScore,
        awayScore: r.awayScore,
        winnerLabel: r.winnerLabel,
      }))}
      tournament={tournament}
    />
  );
}
