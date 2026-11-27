import express from 'express';
import {
  getPracticeTasks,
  getPracticeTaskById,
  createPracticeTask,
  updatePracticeTask,
  deletePracticeTask,
  toggleTaskCompletion,
  getPracticeProgress,
} from '../controllers/practiceController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/tasks', optionalAuth, getPracticeTasks);
router.get('/tasks/:id', optionalAuth, getPracticeTaskById);
router.get('/progress', optionalAuth, getPracticeProgress);

router.post('/toggle-complete', optionalAuth, toggleTaskCompletion);

router.post('/tasks', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), createPracticeTask);
router.put('/tasks/:id', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), updatePracticeTask);
router.delete('/tasks/:id', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), deletePracticeTask);

export default router;
