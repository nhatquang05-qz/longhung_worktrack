import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import * as userRepository from '../repositories/userRepository.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Bạn chưa đăng nhập hoặc phiên làm việc không hợp lệ',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại trên hệ thống',
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản của bạn đã bị vô hiệu hóa',
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      isAdmin: Boolean(user.is_admin),
      mustChangePassword: Boolean(user.must_change_password),
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ',
    });
  }
};