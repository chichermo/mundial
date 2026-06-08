import { PrismaClient, type Prisma } from "@prisma/client";
import { PrismaLibSQL as PrismaLibSQLNode } from "@prisma/adapter-libsql";
import { PrismaLibSQL as PrismaLibSQLWeb } from "@prisma/adapter-libsql/web";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  const log: Prisma.LogLevel[] =
    process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

  const url = process.env.DATABASE_URL ?? "";

  if (url.startsWith("libsql:")) {
    const authToken = process.env.DATABASE_AUTH_TOKEN;
    const config = { url, authToken };

    const PrismaLibSQL = process.env.VERCEL ? PrismaLibSQLWeb : PrismaLibSQLNode;
    const adapter = new PrismaLibSQL(config);

    return new PrismaClient({ adapter, log });
  }

  if (process.env.VERCEL) {
    console.error("[prisma] DATABASE_URL debe ser libsql://... en Vercel");
  }

  return new PrismaClient({ log });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;
