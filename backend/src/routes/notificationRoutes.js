import { Router } from 'express';
import { handleGetNotifications } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', handleGetNotifications);

export default router;