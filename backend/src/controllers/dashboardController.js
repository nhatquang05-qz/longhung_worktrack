import * as dashboardService from '../services/dashboardService.js';

export const handleGetDashboardStats = async (req, res, next) => {
  try {
    const scope = req.query.scope;
    const targetUserId = scope === 'my' ? req.user.id : null;

    const stats = await dashboardService.getDashboardStats(targetUserId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};