import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`  KHO-KHO ARENA BACKEND SERVER ONLINE`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Port:        ${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`==================================================`);
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
  } catch (error) {
    console.error('[Server] Fatal Error during startup:', error.message);
    process.exit(1);
  }
};

startServer();
