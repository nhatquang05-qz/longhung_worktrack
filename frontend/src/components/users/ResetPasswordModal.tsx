import React, { useState } from 'react';
import { X, KeyRound, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { ApiResponse } from '../../types/api';
import { ManagedUser } from '../../types/user';

interface ResetPasswordModalProps {
  user: ManagedUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const handleReset = async () => {
    setError('');
    setLoading(true);

    try {
      const res = (await api.post(`/users/${user.id}/reset-password`)) as unknown as ApiResponse;
      if (res.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Không thể đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-semibold">
            <KeyRound size={18} className="text-amber-500" />
            <span>Đặt Lại Mật Khẩu</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 text-sm rounded-lg bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-400">
            Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản{' '}
            <strong className="text-slate-900 dark:text-slate-100">{user.fullName}</strong> (@{user.username})?
          </p>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-xs text-amber-800 dark:text-amber-300">
            Mật khẩu sẽ trở về <span className="font-mono font-bold">password123</span> và người dùng này sẽ phải đổi lại mật khẩu khi đăng nhập.
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleReset}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt lại'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};