import { redirect } from "next/navigation";
import { AccountLogout } from "@/components/AccountLogout";
import { BalsuosPollaHub } from "@/components/BalsuosPollaHub";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBalsuosGroupPublic, getBalsuosMembership } from "@/lib/balsuos-group";
import { getPollaSession, getUserSession } from "@/lib/session";

export default async function GruposPage() {
  const user = await getUserSession();
  if (!user) redirect("/cuenta/login?next=/polla/grupos");

  const polla = await getPollaSession();
  const group = await getBalsuosGroupPublic();
  const membership = await getBalsuosMembership(user.userId);

  if (membership && !polla) {
    const { switchToMember } = await import("@/lib/polla-groups");
    await switchToMember(user.userId, membership.memberId);
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
