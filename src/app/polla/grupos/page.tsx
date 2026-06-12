import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountLogout } from "@/components/AccountLogout";
import { BalsuosPollaHub } from "@/components/BalsuosPollaHub";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBalsuosGroupPublic, getBalsuosMembership } from "@/lib/balsuos-group";
import { rethrowIfNavigationError } from "@/lib/next-errors";
import { getPollaSession, getUserSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function GruposLoadError() {
  return (
    <div className="card mx-auto max-w-md space-y-4 p-6 text-center">
      <p className="font-display text-2xl text-cream">No pudimos cargar el grupo</p>
      <p className="text-sm text-muted">
        Error temporal al conectar con la base de datos. Intenta de nuevo en unos segundos.
      </p>
      <Link href="/polla/grupos" className="btn-primary inline-block">
        Reintentar
      </Link>
    </div>
  );
}

export default async function GruposPage() {
  const user = await getUserSession();
  if (!user) redirect("/cuenta/login?next=/polla/grupos");

  let polla;
  let group;
  let membership;

  try {
    polla = await getPollaSession();
    group = await getBalsuosGroupPublic();
    membership = await getBalsuosMembership(user.userId);
  } catch (err) {
    rethrowIfNavigationError(err);
    console.error("[polla/grupos]", err);
    return <GruposLoadError />;
  }

  if (membership && !polla) {
    redirect("/api/polla/session/restore");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Polla de amigos"
        title={group.name}
        description="Un solo grupo para todos. Comparte el código o únete con un clic."
        actions={<AccountLogout />}
      />
      <BalsuosPollaHub
        groupName={group.name}
        groupCode={group.code}
        memberCount={group.memberCount}
        membership={
          membership
            ? {
                memberId: membership.memberId,
                memberCount: membership.memberCount,
                predictionsCount: membership.predictionsCount,
              }
            : null
        }
        isActive={polla?.memberId === membership?.memberId}
        userName={user.displayName}
      />
    </div>
  );
}
