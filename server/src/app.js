import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

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

const app = express();

// Trust proxy for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
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
      if (!origin || allowedOrigins.includes(origin)) {
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

// Health check endpoint with real MongoDB connection inspection
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  return res.status(isDbConnected ? 200 : 503).json({
    success: isDbConnected,
    name: 'KHO-KHO ARENA API',
    status: isDbConnected ? 'HEALTHY' : 'DATABASE_DISCONNECTED',
    database: isDbConnected ? 'Connected to MongoDB' : 'Disconnected from MongoDB',
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

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
