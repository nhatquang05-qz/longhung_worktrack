import * as authService from '../services/authService.js';
import { loginSchema, changePasswordSchema } from '../validators/authValidator.js';

export const handleLogin = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: error.errors[0]?.message || 'Dữ liệu không hợp lệ',
      });
    }
    next(error);
  }
};

export const handleGetMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

export const handleChangePassword = async (req, res, next) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(req.user.id, validatedData);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: error.errors[0]?.message || 'Dữ liệu không hợp lệ',
      });
    }
    next(error);
  }
};