import express from 'express';
import {
  login,
  logout,
  getMe,
  changePassword,
  directChangePassword,
  getAllUsers,
  impersonateUser,
  toggleUserStatus,
  resetUserPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', loginLimiter, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.post('/direct-change-password', loginLimiter, directChangePassword);

// Super Admin Process Routes: Full System User Access & Impersonation
router.get('/users', protect, requireRole('SUPER_ADMIN'), getAllUsers);
router.post('/impersonate', protect, requireRole('SUPER_ADMIN'), impersonateUser);
router.patch('/users/:id/status', protect, requireRole('SUPER_ADMIN'), toggleUserStatus);
router.patch('/users/:id/reset-password', protect, requireRole('SUPER_ADMIN'), resetUserPassword);

export default router;
