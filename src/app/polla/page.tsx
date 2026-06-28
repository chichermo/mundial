import Link from "next/link";
import { redirect } from "next/navigation";
import { CopyInviteCode } from "@/components/CopyInviteCode";
import { EnableNotificationsButton } from "@/components/PredictionReminders";
import { LeaveGroupButton } from "@/components/LeaveGroupButton";
import { FeaturedMatchBanner } from "@/components/FeaturedMatchBanner";
import { LiveStandingsTable } from "@/components/LiveStandingsTable";
import { QualifiersBanner } from "@/components/QualifiersBanner";
import { PollaDashboard } from "@/components/PollaDashboard";
import { PollaProgressCard } from "@/components/PollaProgressCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLeaderboard } from "@/lib/groups";
import { loadPollaMember } from "@/lib/polla-member";
import { getPollaProgress } from "@/lib/polla-progress";
import { prisma } from "@/lib/prisma";
import { serializePredictions, serializeTournamentPick } from "@/lib/serialize-polla";
import { rethrowIfNavigationError } from "@/lib/next-errors";
import { getPollaSession, getUserSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function PollaLoadError() {
  return (
    <div className="card mx-auto max-w-md space-y-4 p-6 text-center">
      <p className="font-display text-2xl text-cream">No pudimos cargar la polla</p>
      <p className="text-sm text-muted">
        Error temporal de base de datos. Espera unos segundos e intenta de nuevo.
      </p>
      <Link href="/polla" className="btn-primary inline-block">
        Reintentar
      </Link>
    </div>
  );
}

export default async function PollaPage() {
  const user = await getUserSession();
  if (!user) redirect("/cuenta/login?next=/polla");

  const polla = await getPollaSession();
  if (!polla) redirect("/polla/grupos");

  let loaded;
  try {
    loaded = await loadPollaMember(polla.memberId, user.userId);
  } catch (err) {
    rethrowIfNavigationError(err);
    console.error("[polla] Error cargando datos:", err);
    return <PollaLoadError />;
  }

  if (!loaded) redirect("/polla/grupos");

  try {
    const { member } = loaded;

    const knockout: Record<number, string> = {};
    for (const k of member.knockoutPredictions) {
      knockout[k.matchId] = k.winnerLabel;
    }

    const results: Record<
      number,
      { homeScore: number | null; awayScore: number | null; winnerLabel?: string | null }
    > = {};
    try {
      const allResults = await prisma.matchResult.findMany();
      for (const r of allResults) {
        results[r.matchId] = {
          homeScore: r.homeScore,
          awayScore: r.awayScore,
          winnerLabel: r.winnerLabel,
        };
      }
    } catch (err) {
      console.error("[polla] Error cargando resultados:", err);
    }

    let myRank = 0;
    try {
      const leaderboard = await getLeaderboard(polla.groupId);
      myRank = leaderboard.findIndex((r) => r.id === member.id) + 1;
    } catch (err) {
      console.error("[polla] Error cargando ranking:", err);
    }

    const progress = getPollaProgress({
      matchPredictions: member.matchPredictions.length,
      knockoutPredictions: member.knockoutPredictions.length,
      hasTournamentPick: Boolean(
        member.tournamentPick?.champion ||
          member.tournamentPick?.topScorer ||
          member.tournamentPick?.surprise,
      ),
    });

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
      <FeaturedMatchBanner />
      <QualifiersBanner />
      <PollaProgressCard progress={progress} />

      <LiveStandingsTable highlightId={member.id} />

      <PollaDashboard
        memberId={member.id}
        predictions={serializePredictions(member.matchPredictions)}
        knockout={knockout}
        results={results}
        tournament={serializeTournamentPick(member.tournamentPick)}
        progress={progress}
      />
    </div>
    );
  } catch (err) {
    rethrowIfNavigationError(err);
    console.error("[polla] Error renderizando página:", err);
    return <PollaLoadError />;
  }
}
