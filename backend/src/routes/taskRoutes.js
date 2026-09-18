import { Router } from 'express';
import {
  handleGetTasks,
  handleGetMyTasks,
  handleGetTaskDetail,
  handleCreateTask,
  handleUpdateTask,
  handleDeleteTask,
} from '../controllers/taskController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', handleGetTasks);
router.get('/my', handleGetMyTasks);
router.get('/:id', handleGetTaskDetail);
router.post('/', handleCreateTask);
router.put('/:id', handleUpdateTask);
router.delete('/:id', handleDeleteTask);

export default router;