import express from 'express';
import {
  getMatchHighlights,
  getMatchHighlightById,
  createMatchHighlight,
  updateMatchHighlight,
  deleteMatchHighlight,
} from '../controllers/matchHighlightController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getMatchHighlights);
router.get('/:id', optionalAuth, getMatchHighlightById);

router.post('/', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), createMatchHighlight);
router.put('/:id', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), updateMatchHighlight);
router.delete('/:id', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), deleteMatchHighlight);

export default router;
