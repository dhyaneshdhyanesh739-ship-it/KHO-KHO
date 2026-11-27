import express from 'express';
import {
  getPlayersPerformance,
  getPlayerPerformanceById,
  createPlayerPerformance,
  updatePlayerPerformance,
  deletePlayerPerformance,
  getTeamPerformance,
  updateTeamPerformance,
} from '../controllers/performanceController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/players', optionalAuth, getPlayersPerformance);
router.get('/players/:id', optionalAuth, getPlayerPerformanceById);
router.get('/teams', optionalAuth, getTeamPerformance);

router.post('/players', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), createPlayerPerformance);
router.put('/players/:id', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), updatePlayerPerformance);
router.delete('/players/:id', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), deletePlayerPerformance);
router.put('/teams/:team', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), updateTeamPerformance);

export default router;
