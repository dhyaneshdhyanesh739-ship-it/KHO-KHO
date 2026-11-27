import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', optionalAuth, getDashboardStats);

export default router;
