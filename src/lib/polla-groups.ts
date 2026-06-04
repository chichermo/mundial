import { prisma } from "@/lib/prisma";
import { generateGroupCode, setPollaSession, type PollaSession } from "@/lib/session";

export async function createGroupForUser(
  userId: string,
  displayName: string,
  groupName: string,
): Promise<{ group: { id: string; name: string; code: string }; session: PollaSession }> {
  let code = generateGroupCode();
  for (let i = 0; i < 8; i++) {
    const exists = await prisma.pollaGroup.findUnique({ where: { code } });
    if (!exists) break;
    code = generateGroupCode();
  }

  const group = await prisma.pollaGroup.create({
    data: {
      name: groupName,
      code,
      ownerId: userId,
      members: {
        create: {
          userId,
          name: displayName,
        },
      },
    },
    include: { members: true },
  });

  const member = group.members[0];
  const session: PollaSession = {
    memberId: member.id,
    memberName: member.name,
    groupId: group.id,
    groupName: group.name,
    groupCode: group.code,
  };
  await setPollaSession(session);
  return { group: { id: group.id, name: group.name, code: group.code }, session };
}

export async function joinGroupWithCode(
  userId: string,
  displayName: string,
  code: string,
): Promise<{ session: PollaSession } | { error: string }> {
  const group = await prisma.pollaGroup.findUnique({
    where: { code: code.toUpperCase() },
    include: { members: true },
  });

  if (!group) return { error: "Código no encontrado. Revisa que esté bien escrito." };

  let member = group.members.find((m) => m.userId === userId);

  if (!member) {
    member = await prisma.member.create({
      data: {
        userId,
        name: displayName,
        groupId: group.id,
      },
    });
  } else if (member.name !== displayName) {
    member = await prisma.member.update({
      where: { id: member.id },
      data: { name: displayName },
    });
  }

  const session: PollaSession = {
    memberId: member.id,
    memberName: member.name,
    groupId: group.id,
    groupName: group.name,
    groupCode: group.code,
  };
  await setPollaSession(session);
  return { session };
}

export async function switchToMember(
  userId: string,
  memberId: string,
): Promise<PollaSession | null> {
  const member = await prisma.member.findFirst({
    where: { id: memberId, userId },
    include: { group: true },
  });
  if (!member) return null;

  const session: PollaSession = {
    memberId: member.id,
    memberName: member.name,
    groupId: member.group.id,
    groupName: member.group.name,
    groupCode: member.group.code,
  };
  await setPollaSession(session);
  return session;
}

export async function getUserGroups(userId: string) {
  const memberships = await prisma.member.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          _count: { select: { members: true } },
          owner: { select: { displayName: true } },
        },
      },
      _count: {
        select: { matchPredictions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return memberships.map((m) => ({
    memberId: m.id,
    groupId: m.group.id,
    groupName: m.group.name,
    groupCode: m.group.code,
    memberCount: m.group._count.members,
    ownerName: m.group.owner?.displayName ?? null,
    isOwner: m.group.ownerId === userId,
    predictionsCount: m._count.matchPredictions,
  }));
}
