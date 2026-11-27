import express from 'express';
import {
  getTutorials,
  getTutorialById,
  createTutorial,
  updateTutorial,
  deleteTutorial,
  toggleTutorialProgress,
  getMyProgress,
} from '../controllers/tutorialController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public / Guest read
router.get('/', optionalAuth, getTutorials);
router.get('/progress/me', optionalAuth, getMyProgress);
router.get('/:id', optionalAuth, getTutorialById);

// Progress toggle (public or logged-in)
router.post('/:id/progress', optionalAuth, toggleTutorialProgress);

// Admin mutations
router.post('/', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), createTutorial);
router.put('/:id', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), updateTutorial);
router.delete('/:id', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), deleteTutorial);

export default router;
