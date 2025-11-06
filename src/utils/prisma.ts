import { PrismaClient } from '@prisma/client';

// Instance singleton de Prisma Client
export const prisma = new PrismaClient();

// Gestion propre de l'arrêt
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

