export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền quản trị để thực hiện hành động này',
    });
  }
  next();
};