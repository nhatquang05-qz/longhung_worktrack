import * as notificationService from '../services/notificationService.js';

export const handleGetNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getUserNotifications(req.user.id);
    return res.status(200).json({
      success: true,
      data: result.notifications,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};