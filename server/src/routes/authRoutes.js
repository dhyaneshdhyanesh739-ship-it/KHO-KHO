import express from 'express';
import { login, logout, getMe, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', loginLimiter, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

export default router;
