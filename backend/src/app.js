import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

const allowedOrigin = ENV.CLIENT_URL ? ENV.CLIENT_URL.trim() : '*';

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép các công cụ không gửi origin (như curl/postman) hoặc trùng khớp với allowedOrigin
    if (!origin || allowedOrigin === '*' || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Chặn bởi CORS Policy'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint root phục vụ kiểm tra nhanh domain chính
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Long Hưng WorkTrack API is running',
    timestamp: new Date().toISOString(),
  });
});

// Middleware chuẩn hóa URL: đảm bảo luôn có tiền tố /api khi định tuyến trong Express
app.use((req, res, next) => {
  if (req.url !== '/' && !req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }
  next();
});

// Đăng ký các routes chính thức
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Bắt các route không tồn tại
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Tài nguyên API không tồn tại',
  });
});

app.use(errorHandler);

export default app;