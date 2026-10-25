import express from 'express';
import {
  getAchievements,
  createAchievement,
  deleteAchievement,
  getGallery,
  createGalleryItem,
  deleteGalleryItem,
  submitContactMessage,
  getContactMessages,
  getAuditLogs,
} from '../controllers/contentController.js';
import { seedDatabase } from '../config/seed.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { contactLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public Content Endpoints
router.get('/achievements', getAchievements);
router.get('/gallery', getGallery);
router.post('/contact', contactLimiter, submitContactMessage);

// Protected Admin Content Management
router.post('/achievements', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), createAchievement);
router.delete('/achievements/:id', protect, requireRole('SUPER_ADMIN'), deleteAchievement);

router.post('/gallery', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), createGalleryItem);
router.delete('/gallery/:id', protect, requireRole('SUPER_ADMIN'), deleteGalleryItem);

router.get('/contact-messages', protect, requireRole('SUPER_ADMIN', 'BOYS_ADMIN', 'GIRLS_ADMIN'), getContactMessages);
router.get('/audit-logs', protect, requireRole('BOYS_ADMIN', 'GIRLS_ADMIN', 'SUPER_ADMIN'), getAuditLogs);

// Demo Seed Route (For fast demo evaluation)
router.post('/demo/seed', protect, async (req, res, next) => {
  try {
    await seedDatabase();
    return res.status(200).json({
      success: true,
      message: 'Demo dataset populated successfully with 23 Boys, 13 Girls, realistic attendance sessions, matches, and announcements.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
