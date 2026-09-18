import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { HealthResponse } from '../types/api';

const HomePage: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = (await api.get('/health')) as unknown as HealthResponse;
        setHealth(res);
      } catch (err: any) {
        setError(err.message || 'Không thể kết nối đến máy chủ');
      } finally {
        setLoading(false);
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Khởi tạo dự án (Phase 1)
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Hệ thống nền móng TypeScript cho ứng dụng Quản lý công việc.
        </p>
      </div>

      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-w-xl">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
          Kiểm tra kết nối Backend & Database:
        </h3>

        {loading && (
          <p className="text-sm text-slate-500">Đang kiểm tra kết nối API...</p>
        )}

        {error && (
          <div className="p-3 text-sm rounded-lg bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
            Lỗi kết nối: {error}
          </div>
        )}

        {health && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-600 dark:text-slate-300">Server status:</span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400">
                {health.status}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-600 dark:text-slate-300">MySQL:</span>
              <span className="text-slate-700 dark:text-slate-200">{health.database}</span>
            </div>
            <div className="text-xs text-slate-400">
              Timestamp: {health.timestamp}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;