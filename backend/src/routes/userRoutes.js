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
router.use(requireAdmin);

router.get('/', handleGetUsers);
router.post('/', handleCreateUser);
router.patch('/:id/toggle-status', handleToggleUserStatus);
router.post('/:id/reset-password', handleResetUserPassword);

export default router;