import express from 'express';
import {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  togglePlayerStatus,
  exportPlayersCSV,
  importPlayersCSV,
} from '../controllers/playerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { enforceTeamAccess } from '../middleware/teamIsolationMiddleware.js';

const router = express.Router();

router.use(protect);

// Players list & single player viewable by ADMIN or PLAYER (with team isolation)
router.get('/', enforceTeamAccess, getPlayers);
router.get('/export-csv', enforceTeamAccess, exportPlayersCSV);
router.get('/:id', getPlayerById);

// Admin modifications strictly restricted to BOYS_ADMIN, GIRLS_ADMIN, or SUPER_ADMIN
router.post('/', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, createPlayer);
router.post('/import-csv', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, importPlayersCSV);
router.put('/:id', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, updatePlayer);
router.patch('/:id/status', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, togglePlayerStatus);

export default router;
