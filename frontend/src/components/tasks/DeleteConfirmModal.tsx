import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { TaskItem } from '../../types/task';
import api from '../../services/api';
import { ApiResponse } from '../../types/api';

interface DeleteConfirmModalProps {
  task: TaskItem | null;
  onClose: () => void;
  onSuccess: (deletedId: number) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  task,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!task) return null;

  const handleDelete = async () => {
    setError('');
    setLoading(true);

    try {
      const res = (await api.delete(`/tasks/${task.id}`)) as unknown as ApiResponse;
      if (res.success) {
        onSuccess(task.id);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Không thể xóa công việc');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-semibold">
            <AlertTriangle size={18} />
            <span>Xác Nhận Xóa Công Việc</span>
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
            <div className="p-3 text-sm rounded-lg bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Bạn có chắc chắn muốn xóa công việc:{' '}
            <strong className="text-slate-900 dark:text-slate-100">"{task.title}"</strong>?
          </p>
          <p className="text-xs text-slate-400">
            Hành động này không thể hoàn tác và toàn bộ phân công của task sẽ bị gỡ bỏ.
          </p>

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
              onClick={handleDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};