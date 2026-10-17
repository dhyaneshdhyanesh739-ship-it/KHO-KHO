import express from 'express';
import {
  getOverviewStats,
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getCustomReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { enforceTeamAccess } from '../middleware/teamIsolationMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/overview', enforceTeamAccess, getOverviewStats);
router.get('/daily', enforceTeamAccess, getDailyReport);
router.get('/weekly', enforceTeamAccess, getWeeklyReport);
router.get('/monthly', enforceTeamAccess, getMonthlyReport);
router.get('/custom', enforceTeamAccess, getCustomReport);

export default router;
