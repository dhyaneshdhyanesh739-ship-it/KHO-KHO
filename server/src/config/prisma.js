import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const FALLBACK_DATABASE_URL =
  'postgresql://neondb_owner:npg_zNBa4QVpTw7j@ep-withered-art-b51j175v-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

const connectionString = process.env.DATABASE_URL || FALLBACK_DATABASE_URL;

const adapter = new PrismaPg({
  connectionString,
});

export const prisma = new PrismaClient({ adapter });

export default prisma;
