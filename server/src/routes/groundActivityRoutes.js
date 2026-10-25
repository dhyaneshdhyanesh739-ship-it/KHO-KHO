import express from 'express';
import {
  createGroundActivity,
  getAdminGroundActivities,
  getPlayerGroundActivities,
  updateGroundActivity,
  deleteGroundActivity,
} from '../controllers/groundActivityController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { enforceTeamAccess } from '../middleware/teamIsolationMiddleware.js';

const router = express.Router();

router.use(protect);

// Player endpoint: Returns ground activities ONLY for dates where the player was PRESENT or LATE
router.get('/player', enforceTeamAccess, getPlayerGroundActivities);

// Admin endpoints
router.get('/admin', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, getAdminGroundActivities);
router.post('/', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, createGroundActivity);
router.put('/:id', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, updateGroundActivity);
router.delete('/:id', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, deleteGroundActivity);

export default router;
