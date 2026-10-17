import express from 'express';
import {
  getSessions,
  getSessionDetails,
  createSession,
  saveBatchAttendance,
  finalizeSession,
  getPlayerAttendance,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { enforceTeamAccess } from '../middleware/teamIsolationMiddleware.js';

const router = express.Router();

router.use(protect);

// Sessions list
router.get('/sessions', enforceTeamAccess, getSessions);
router.get('/sessions/:id', getSessionDetails);
router.get('/player/:playerId', getPlayerAttendance);

// Only admins can create sessions, mark attendance, or finalize
router.post('/sessions', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, createSession);
router.post('/batch', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), saveBatchAttendance);
router.put('/sessions/:id/finalize', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), finalizeSession);

export default router;
