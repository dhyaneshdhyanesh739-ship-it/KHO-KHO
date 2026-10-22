import prisma from './prisma.js';

export const connectDB = async () => {
  try {
    // Perform simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('[PostgreSQL/Neon] Connected successfully via Prisma!');
    return prisma;
  } catch (error) {
    console.error('[PostgreSQL/Neon] Connection Failed!');
    console.error(`[PostgreSQL/Neon] Error: ${error.message}`);
    throw error;
  }
};

export default connectDB;
