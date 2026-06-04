import { prisma } from "@/lib/prisma";
import { getPollaSession, getUserSession, type PollaSession, type UserSession } from "@/lib/session";

export async function requireUser(): Promise<(UserSession & { notifyMatchReminders?: boolean }) | null> {
  const session = await getUserSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { notifyMatchReminders: true },
  });

  return { ...session, notifyMatchReminders: user?.notifyMatchReminders ?? true };
}

export async function requirePollaMember(): Promise<
  (UserSession & { polla: PollaSession }) | null
> {
  const user = await getUserSession();
  const polla = await getPollaSession();
  if (!user || !polla) return null;

  const member = await prisma.member.findFirst({
    where: { id: polla.memberId, userId: user.userId },
  });
  if (!member) return null;

  return { ...user, polla };
}
