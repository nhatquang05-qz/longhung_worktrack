import { Router } from 'express';
import { testDbConnection } from '../config/db.js';

const router = Router();

router.get('/health', async (req, res) => {
  const dbStatus = await testDbConnection();

  return res.status(dbStatus.ok ? 200 : 503).json({
    success: dbStatus.ok,
    status: dbStatus.ok ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    database: dbStatus.message,
  });
});

export default router;