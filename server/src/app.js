import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import prisma from './config/prisma.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import groundActivityRoutes from './routes/groundActivityRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const app = express();

// Trust proxy for rate limiting behind reverse proxies (Render, Railway, etc.)
app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.railway.app') ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiting
app.use('/api', generalLimiter);

// Health check endpoint with real PostgreSQL/Prisma connection inspection
app.get('/api/health', async (req, res) => {
  let isDbConnected = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
  } catch (err) {
    isDbConnected = false;
  }
  return res.status(200).json({
    success: true,
    name: 'KHO-KHO ARENA API',
    status: isDbConnected ? 'HEALTHY' : 'INITIALIZING',
    database: isDbConnected ? 'Connected to PostgreSQL (Neon)' : 'Connecting to PostgreSQL',
    timestamp: new Date().toISOString(),
  });
});

// Modular API Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/ground-activities', groundActivityRoutes);
app.use('/api', contentRoutes);

// Serve static client assets in production (or whenever client/dist exists)
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback for all GET requests that do not target /api
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(clientDistPath, 'index.html'));
  });
}

// 404 Route Handler for unmatched API endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
