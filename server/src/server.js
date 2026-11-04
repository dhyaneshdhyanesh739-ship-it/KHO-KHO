import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from all standard locations
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = '0.0.0.0';

// Immediately start listening on 0.0.0.0:PORT so Render / container port scan detects open port instantly
const server = app.listen(PORT, HOST, () => {
  console.log(`==================================================`);
  console.log(`  KHO-KHO ARENA BACKEND SERVER ONLINE`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Host:        ${HOST}`);
  console.log(`  Port:        ${PORT}`);
  console.log(`  Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`==================================================`);
});

// Asynchronously connect to PostgreSQL/Prisma without blocking port listener
connectDB()
  .then(() => {
    console.log('[Database] PostgreSQL (Neon) connection established and ready.');
  })
  .catch((err) => {
    console.warn('[Database] Initial connection warning (will retry on incoming requests):', err.message);
  });

// Handle graceful shutdown
const handleShutdown = () => {
  console.log('\n[Server] Gracefully shutting down...');
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
