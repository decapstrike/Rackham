import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { learningForgePrisma?: PrismaClient };

export const prisma = globalForPrisma.learningForgePrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.learningForgePrisma = prisma;
}
