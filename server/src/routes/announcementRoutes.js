import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { enforceTeamAccess } from '../middleware/teamIsolationMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', enforceTeamAccess, getAnnouncements);
router.post('/', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, createAnnouncement);
router.put('/:id', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, updateAnnouncement);
router.delete('/:id', requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), enforceTeamAccess, deleteAnnouncement);

export default router;
