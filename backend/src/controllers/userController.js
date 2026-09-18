import * as userService from '../services/userService.js';
import { createUserSchema } from '../validators/userValidator.js';

export const handleGetUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const handleCreateUser = async (req, res, next) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const user = await userService.createUser(validatedData);

    return res.status(201).json({
      success: true,
      message: 'Tạo tài khoản thành công',
      data: user,
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

export const handleToggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.toggleUserStatus(id, req.user.id);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const handleResetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userService.resetUserPassword(id, req.user.id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};