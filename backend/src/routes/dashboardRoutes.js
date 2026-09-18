import { Router } from 'express';
import { handleGetDashboardStats, handleGetRecentActivities } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/stats', handleGetDashboardStats);
router.get('/activities', handleGetRecentActivities);

export default router;