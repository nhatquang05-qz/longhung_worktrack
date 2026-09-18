import React, { useEffect, useState } from 'react';
import { UserPlus, KeyRound, Lock, Unlock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { ApiResponse } from '../types/api';
import { ManagedUser } from '../types/user';
import { CreateUserModal } from '../components/users/CreateUserModal';
import { ResetPasswordModal } from '../components/users/ResetPasswordModal';
import { useAuth } from '../contexts/AuthContext';

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<ManagedUser | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = (await api.get('/users')) as unknown as ApiResponse<ManagedUser[]>;
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: ManagedUser) => {
    if (user.id === currentUser?.id) return;
    const confirmMessage = user.isActive
      ? `Bạn có chắc muốn khóa tài khoản "${user.fullName}"? Người này sẽ không thể đăng nhập.`
      : `Mở khóa cho tài khoản "${user.fullName}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const res = (await api.patch(`/users/${user.id}/toggle-status`)) as unknown as ApiResponse;
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
        );
        showNotification(user.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      }
    } catch (err: any) {
      alert(err.message || 'Thao tác thất bại');
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Quản Lý Tài Khoản
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Danh sách nhân sự và phân quyền truy cập hệ thống.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
        >
          <UserPlus size={16} />
          <span>Thêm thành viên</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3 text-sm rounded-lg bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-200 dark:border-green-900">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 p-3 text-sm rounded-lg bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* User Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4 w-14 text-center">STT</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Tên đăng nhập</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Ngày tạo</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Chưa có tài khoản nào
                  </td>
                </tr>
              ) : (
                users.map((item, index) => {
                  const isCurrent = item.id === currentUser?.id;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-4 text-center text-slate-400 text-xs font-mono">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-100">
                        <div className="flex items-center space-x-2">
                          <span>{item.fullName}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-normal">
                              Bạn
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                        @{item.username}
                      </td>
                      <td className="py-3 px-4">
                        {item.isAdmin ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            Admin
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">Thành viên</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {item.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isCurrent && (
                          <div className="inline-flex items-center space-x-1">
                            <button
                              onClick={() => setSelectedUserForReset(item)}
                              title="Đặt lại mật khẩu"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition"
                            >
                              <KeyRound size={16} />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(item)}
                              title={item.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                              className={`p-1.5 rounded-lg transition ${
                                item.isActive
                                  ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                                  : 'text-rose-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                              }`}
                            >
                              {item.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(newUser) => {
          setUsers((prev) => [...prev, newUser]);
          showNotification(`Đã tạo thành công tài khoản cho "${newUser.fullName}"`);
        }}
      />

      <ResetPasswordModal
        user={selectedUserForReset}
        onClose={() => setSelectedUserForReset(null)}
        onSuccess={() => {
          showNotification(`Đã đặt lại mật khẩu cho "${selectedUserForReset?.fullName}" về password123`);
        }}
      />
    </div>
  );
};

export default UsersPage;