import { prisma } from "@/lib/prisma";
import { joinGroupWithCode } from "@/lib/polla-groups";
export const BALSUOS_GROUP_NAME = process.env.POLL_GROUP_NAME?.trim() || "Balsuos";
export const BALSUOS_GROUP_CODE = (
  process.env.POLL_GROUP_CODE?.trim().toUpperCase() || "BALSUO"
).slice(0, 6);

/** Crea el grupo único si no existe (p. ej. primer deploy en Vercel). */
export async function ensureBalsuosGroup() {
  const byCode = await prisma.pollaGroup.findUnique({
    where: { code: BALSUOS_GROUP_CODE },
  });
  if (byCode) return byCode;

  const byName = await prisma.pollaGroup.findFirst({
    where: { name: { equals: BALSUOS_GROUP_NAME } },
  });
  if (byName) return byName;

  return prisma.pollaGroup.create({
    data: {
      name: BALSUOS_GROUP_NAME,
      code: BALSUOS_GROUP_CODE,
    },
  });
}

export async function getBalsuosGroupPublic() {
  const group = await ensureBalsuosGroup();
  const memberCount = await prisma.member.count({ where: { groupId: group.id } });
  return {
    id: group.id,
    name: group.name,
    code: group.code,
    memberCount,
  };
}

export async function joinBalsuosGroup(userId: string, displayName: string) {
  await ensureBalsuosGroup();
  return joinGroupWithCode(userId, displayName, BALSUOS_GROUP_CODE);
}

export async function getBalsuosMembership(userId: string) {
  const group = await ensureBalsuosGroup();
  const member = await prisma.member.findFirst({
    where: { userId, groupId: group.id },
    include: {
      _count: { select: { matchPredictions: true } },
    },
  });
  if (!member) return null;
  const memberCount = await prisma.member.count({ where: { groupId: group.id } });
  return {
    memberId: member.id,
    groupId: group.id,
    groupName: group.name,
    groupCode: group.code,
    memberCount,
    predictionsCount: member._count.matchPredictions,
  };
}
