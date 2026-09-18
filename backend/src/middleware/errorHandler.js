export const errorHandler = (err, req, res, next) => {
  console.error('LỖI BACKEND:', err);

  const statusCode = Number(err.statusCode) || 500;
  const message = err.message || 'Lỗi hệ thống máy chủ';

  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'production' ? message : err.stack,
  });
};