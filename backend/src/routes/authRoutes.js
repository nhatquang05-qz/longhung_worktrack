import { Router } from 'express';
import { handleLogin, handleGetMe, handleChangePassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', handleLogin);
router.get('/me', requireAuth, handleGetMe);
router.post('/change-password', requireAuth, handleChangePassword);

export default router;