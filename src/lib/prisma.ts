import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  const log: Prisma.LogLevel[] =
    process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

  const url = process.env.DATABASE_URL ?? "";

  if (process.env.VERCEL && !url.startsWith("libsql:")) {
    console.error(
      "[prisma] En Vercel, DATABASE_URL debe ser libsql://... (no file:./dev.db)",
    );
  }

  if (url.startsWith("libsql:")) {
    const authToken = process.env.DATABASE_AUTH_TOKEN;
    if (!authToken) {
      console.error("[prisma] Falta DATABASE_AUTH_TOKEN para Turso");
    }

    // En Vercel/serverless el cliente nativo falla; usar adaptador web (HTTP).
    const adapterPkg = process.env.VERCEL
      ? "@prisma/adapter-libsql/web"
      : "@prisma/adapter-libsql";

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require(adapterPkg) as typeof import("@prisma/adapter-libsql");

    const adapter = new PrismaLibSQL({
      url,
      authToken,
    });

    return new PrismaClient({ adapter, log });
  }

  return new PrismaClient({ log });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Singleton en serverless (Vercel reutiliza el mismo proceso entre invocaciones).
globalForPrisma.prisma = prisma;
