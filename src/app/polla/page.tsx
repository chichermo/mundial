import Link from "next/link";
import { redirect } from "next/navigation";
import { CopyInviteCode } from "@/components/CopyInviteCode";
import { EnableNotificationsButton } from "@/components/PredictionReminders";
import { LeaveGroupButton } from "@/components/LeaveGroupButton";
import { PollaDashboard } from "@/components/PollaDashboard";
import { PollaProgressCard } from "@/components/PollaProgressCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLeaderboard } from "@/lib/groups";
import { getPollaProgress } from "@/lib/polla-progress";
import { prisma } from "@/lib/prisma";
import { getPollaSession, getUserSession } from "@/lib/session";

export default async function PollaPage() {
  const user = await getUserSession();
  if (!user) redirect("/cuenta/login?next=/polla");

  const polla = await getPollaSession();
  if (!polla) redirect("/polla/grupos");

  const member = await prisma.member.findFirst({
    where: { id: polla.memberId, userId: user.userId },
    include: {
      matchPredictions: true,
      knockoutPredictions: true,
      tournamentPick: true,
    },
  });

  if (!member) redirect("/polla/grupos");

  const knockout: Record<number, string> = {};
  for (const k of member.knockoutPredictions) {
    knockout[k.matchId] = k.winnerLabel;
  }

  const leaderboard = await getLeaderboard(polla.groupId);
  const progress = getPollaProgress({
    matchPredictions: member.matchPredictions.length,
    knockoutPredictions: member.knockoutPredictions.length,
    hasTournamentPick: Boolean(
      member.tournamentPick?.champion ||
        member.tournamentPick?.topScorer ||
        member.tournamentPick?.surprise,
    ),
  });

  const myRank = leaderboard.findIndex((r) => r.id === member.id) + 1;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Polla activa"
        title={polla.groupName}
        description={`Hola ${user.displayName}${myRank > 0 ? ` · Puesto #${myRank} en el ranking` : ""}`}
        actions={
          <>
            <EnableNotificationsButton />
            <LeaveGroupButton />
            <Link href="/polla/reglas" className="btn-ghost text-sm">
              Reglas
            </Link>
          </>
        }
      />

      <CopyInviteCode code={polla.groupCode} />
      <PollaProgressCard progress={progress} />

      <PollaDashboard
        memberId={member.id}
        predictions={member.matchPredictions.map((p) => ({
          matchId: p.matchId,
          homeScore: p.homeScore,
          awayScore: p.awayScore,
        }))}
        knockout={knockout}
        tournament={member.tournamentPick ?? {}}
        leaderboard={leaderboard}
        progress={progress}
      />
    </div>
  );
}
