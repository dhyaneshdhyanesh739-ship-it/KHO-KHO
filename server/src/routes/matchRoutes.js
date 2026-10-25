import express from 'express';
import {
  getMatches,
  getMatchById,
  createMatch,
  getSquadRecommendations,
  saveSquad,
  finalizeAndPublishSquad,
} from '../controllers/matchController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { enforceTeamAccess } from '../middleware/teamIsolationMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', enforceTeamAccess, getMatches);
router.get('/:id', enforceTeamAccess, getMatchById);
router.get('/:id/recommendations', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, getSquadRecommendations);

router.post('/', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, createMatch);
router.post('/:id/squad', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, saveSquad);
router.put('/:id/squad/finalize', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, finalizeAndPublishSquad);

export default router;
