import { prisma } from "@/lib/prisma";

export async function logAdminChange(action: string, detail: string) {
  try {
    await prisma.adminChangeLog.create({ data: { action, detail } });
  } catch {
    /* tabla puede no existir aún en deploys antiguos */
  }
}

export async function getAdminChangeLogs(limit = 30) {
  try {
    return prisma.adminChangeLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}
