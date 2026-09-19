import { Router } from 'express';
import {
  handleGetUsers,
  handleCreateUser,
  handleToggleUserStatus,
  handleResetUserPassword,
} from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', handleGetUsers);
router.post('/', requireAdmin, handleCreateUser);
router.patch('/:id/toggle-status', requireAdmin, handleToggleUserStatus);
router.post('/:id/reset-password', requireAdmin, handleResetUserPassword);

export default router;