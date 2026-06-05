import { getUserSession, getPollaSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OnboardingModal } from "./OnboardingModal";

export async function OnboardingWrapper() {
  const user = await getUserSession();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { onboardingDone: true },
  });
  const polla = await getPollaSession();

  return (
    <OnboardingModal done={dbUser?.onboardingDone ?? false} hasPolla={Boolean(polla)} />
  );
}
