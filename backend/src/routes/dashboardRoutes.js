import { Router } from 'express';
import { handleGetDashboardStats } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/stats', handleGetDashboardStats);

export default router;