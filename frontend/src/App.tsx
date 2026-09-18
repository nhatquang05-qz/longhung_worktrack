import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import UsersPage from './pages/UsersPage';
import NotFoundPage from './pages/NotFoundPage';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';
import { AdminOnlyRoute } from './components/auth/AdminOnlyRoute';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Route dành riêng cho khách chưa đăng nhập */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Route bắt buộc đổi mật khẩu (nếu must_change_password = true) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* Layout chính và các trang ứng dụng được bảo vệ */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tasks" element={<div className="text-slate-500">Trang Tất cả công việc (Sẽ triển khai sau)</div>} />
          <Route path="/my-tasks" element={<div className="text-slate-500">Trang Công việc của tôi (Sẽ triển khai sau)</div>} />
          <Route path="/notifications" element={<div className="text-slate-500">Trang Thông báo (Sẽ triển khai sau)</div>} />

          {/* Quản lý tài khoản - Chỉ Admin truy cập */}
          <Route element={<AdminOnlyRoute />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;