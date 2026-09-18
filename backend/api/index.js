import app from '../src/app.js';

export default function handler(req, res) {
  // Chuẩn hóa đường dẫn: nếu req.url không bắt đầu bằng /api thì tự thêm /api vào
  // để khớp hoàn toàn với các app.use('/api', ...) trong app.js
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url === '/' ? '' : req.url}`;
  }

  return app(req, res);
}