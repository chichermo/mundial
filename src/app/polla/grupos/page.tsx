import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountLogout } from "@/components/AccountLogout";
import { GroupsHub } from "@/components/GroupsHub";
import { PageHeader } from "@/components/ui/PageHeader";
import { getUserGroups } from "@/lib/polla-groups";
import { getPollaSession, getUserSession } from "@/lib/session";

export default async function GruposPage() {
  const user = await getUserSession();
  if (!user) redirect("/cuenta/login?next=/polla/grupos");

  const polla = await getPollaSession();
  const groups = await getUserGroups(user.userId);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tu cuenta"
        title="Mis grupos"
        description="Crea una polla, invita con el código o únete al grupo de tus amigos."
        actions={<AccountLogout />}
      />
      <Suspense fallback={null}>
        <GroupsHub
          groups={groups}
          activeMemberId={polla?.memberId}
          userName={user.displayName}
        />
      </Suspense>
    </div>
  );
}
