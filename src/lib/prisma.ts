import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

//logging the prisma client connection status
prisma.$connect()
  .then(() => {
    console.log('Prisma client connected to the database');
  })
  .catch((error) => {
    console.error('Error connecting Prisma client to the database:', error);
  });
