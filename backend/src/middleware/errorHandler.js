export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống máy chủ';

  return res.status(statusCode).json({
    success: false,
    message,
  });
};