import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, ArrowRight, BellOff, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { AppNotification } from '../types/notification';
import { formatDateTime } from '../utils/dateUtils';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'OVERDUE' | 'WARNING'>('ALL');
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = (await api.get('/notifications')) as unknown as {
        success: boolean;
        data: AppNotification[];
      };
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải thông báo', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(true);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Thông Báo Hạn Công Việc
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cảnh báo các công việc sắp đến hạn (trong 24 giờ) hoặc đã quá hạn của bạn.
          </p>
        </div>

        <button
          onClick={() => fetchNotifications(true)}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filterType === 'ALL'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('OVERDUE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filterType === 'OVERDUE'
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Quá hạn ({notifications.filter((n) => n.type === 'OVERDUE').length})
        </button>
        <button
          onClick={() => setFilterType('WARNING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filterType === 'WARNING'
              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Sắp đến hạn ({notifications.filter((n) => n.type === 'WARNING').length})
        </button>
      </div>

      {/* Danh sách thông báo */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Đang kiểm tra thời hạn công việc...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <BellOff size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Không có thông báo mới
            </p>
            <p className="text-xs text-slate-400">
              Bạn không có công việc nào bị quá hạn hoặc sắp đến hạn cần xử lý gấp.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isOverdue = n.type === 'OVERDUE';
            return (
              <div
                key={n.id}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isOverdue
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                    }`}
                  >
                    {isOverdue ? <AlertTriangle size={20} /> : <Clock size={20} />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {isOverdue ? 'Quá hạn' : 'Sắp đến hạn'}
                      </span>
                      <span className="text-xs text-slate-400">
                        Hạn chót: {formatDateTime(n.endTime)}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                      {n.title}
                    </h4>

                    <p
                      className={`text-xs font-semibold ${
                        isOverdue
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {n.timeText}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/my-tasks')}
                  className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition shrink-0"
                >
                  <span>Xem công việc</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;