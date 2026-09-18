import * as dashboardService from '../services/dashboardService.js';
import * as activityRepository from '../repositories/activityRepository.js';

export const handleGetDashboardStats = async (req, res, next) => {
  try {
    const scope = req.query.scope;
    const targetUserId = scope === 'my' ? req.user.id : null;

    const filters = {
      search: req.query.search,
      assigneeId: req.query.assigneeId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      timeField: req.query.timeField,
    };

    const stats = await dashboardService.getDashboardStats(filters, targetUserId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetRecentActivities = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const filters = {
      search: req.query.search,
      assigneeId: req.query.assigneeId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const activities = await activityRepository.getRecentActivities(filters, limit);
    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};