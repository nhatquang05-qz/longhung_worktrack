import bcrypt from 'bcryptjs';
import * as userRepository from '../repositories/userRepository.js';

const DEFAULT_PASSWORD = 'password123';

export const getAllUsers = async () => {
  const users = await userRepository.findAll();
  return users.map((u) => ({
    id: u.id,
    fullName: u.full_name,
    username: u.username,
    isAdmin: Boolean(u.is_admin),
    mustChangePassword: Boolean(u.must_change_password),
    isActive: Boolean(u.is_active),
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  }));
};

export const createUser = async ({ fullName, username }) => {
  const existingUser = await userRepository.findByUsername(username);
  if (existingUser) {
    const error = new Error('Tên đăng nhập đã tồn tại trong hệ thống');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const newUserId = await userRepository.create({
    fullName,
    username,
    passwordHash,
  });

  const createdUser = await userRepository.findById(newUserId);
  return {
    id: createdUser.id,
    fullName: createdUser.full_name,
    username: createdUser.username,
    isAdmin: Boolean(createdUser.is_admin),
    mustChangePassword: Boolean(createdUser.must_change_password),
    isActive: Boolean(createdUser.is_active),
    createdAt: createdUser.created_at,
  };
};

export const toggleUserStatus = async (targetUserId, currentUserId) => {
  if (Number(targetUserId) === Number(currentUserId)) {
    const error = new Error('Bạn không thể tự khóa tài khoản quản trị của chính mình');
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findById(targetUserId);
  if (!user) {
    const error = new Error('Không tìm thấy tài khoản người dùng');
    error.statusCode = 404;
    throw error;
  }

  const nextStatus = !user.is_active;
  await userRepository.toggleStatus(targetUserId, nextStatus);

  return {
    userId: targetUserId,
    isActive: nextStatus,
    message: nextStatus ? 'Mở khóa tài khoản thành công' : 'Đã khóa tài khoản',
  };
};

export const resetUserPassword = async (targetUserId, currentUserId) => {
  if (Number(targetUserId) === Number(currentUserId)) {
    const error = new Error('Vui lòng sử dụng tính năng Đổi mật khẩu cá nhân');
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findById(targetUserId);
  if (!user) {
    const error = new Error('Không tìm thấy tài khoản người dùng');
    error.statusCode = 404;
    throw error;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  await userRepository.resetPassword(targetUserId, passwordHash);

  return {
    message: `Đã đặt lại mật khẩu về mặc định (${DEFAULT_PASSWORD}) và yêu cầu đổi mật khẩu ở lần đăng nhập tiếp theo`,
  };
};