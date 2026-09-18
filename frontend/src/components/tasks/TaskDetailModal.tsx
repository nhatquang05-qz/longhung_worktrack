import React from 'react';
import { X, ExternalLink, Calendar, User, Clock, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { TaskItem } from '../../types/task';
import { formatDateTime, checkDeadlineStatus } from '../../utils/dateUtils';

interface TaskDetailModalProps {
  task: TaskItem | null;
  onClose: () => void;
  onEdit?: (task: TaskItem) => void;
  canEdit?: boolean;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onEdit,
  canEdit,
}) => {
  if (!task) return null;

  const deadlineState = checkDeadlineStatus(task.endTime, task.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                task.status === 'COMPLETED'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : task.status === 'IN_PROGRESS'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {task.status === 'COMPLETED'
                ? 'Đã hoàn thành'
                : task.status === 'IN_PROGRESS'
                ? 'Đang làm'
                : 'Chưa làm'}
            </span>
            {deadlineState === 'OVERDUE' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                <AlertTriangle size={12} />
                <span>Quá hạn</span>
              </span>
            )}
            {deadlineState === 'WARNING' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                <Clock size={12} />
                <span>Sắp đến hạn</span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm">
          {/* Nội dung công việc */}
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {task.title}
            </h3>
            <p className="text-xs text-slate-400">
              Người tạo: <span className="font-medium text-slate-600 dark:text-slate-300">{task.creatorName || 'Hệ thống'}</span> • Tạo lúc: {formatDateTime(task.createdAt)}
            </p>
          </div>

          {/* Grid thông tin chi tiết */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 font-medium flex items-center space-x-1">
                <Calendar size={13} />
                <span>Bắt đầu:</span>
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDateTime(task.startTime)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-medium flex items-center space-x-1">
                <Clock size={13} />
                <span>Thời hạn (Deadline):</span>
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDateTime(task.endTime)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-medium flex items-center space-x-1">
                <CheckCircle2 size={13} />
                <span>Ngày hoàn thành:</span>
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDateTime(task.completedAt)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-medium">Hình thức:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {task.format}
              </p>
            </div>

            <div className="space-y-1 sm:col-span-2 border-t border-slate-200 dark:border-slate-700/60 pt-2.5">
              <span className="text-slate-500 font-medium flex items-center space-x-1">
                <User size={13} />
                <span>Người nộp bàn giao:</span>
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {task.submitterName || 'Chưa bàn giao / Chưa có người nộp'}
              </p>
            </div>
          </div>

          {/* Bộ phận thực hiện */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Bộ phận thực hiện ({task.assignees.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {task.assignees.map((a, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg border flex items-center space-x-2 text-xs ${
                    a.isAccount
                      ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                      : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                  }`}
                >
                  <span className="font-semibold">{a.fullName}</span>
                  <span className="text-[10px] opacity-75">
                    {a.isAccount ? `@${a.username}` : '(Khác / Phòng ban)'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Văn bản đính kèm */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Văn bản đính kèm
            </h4>
            {task.driveUrl ? (
              <a
                href={task.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-300 font-medium text-xs transition border border-blue-200 dark:border-blue-900"
              >
                <FileText size={15} />
                <span>Mở tài liệu Google Drive</span>
                <ExternalLink size={13} />
              </a>
            ) : (
              <p className="text-xs text-slate-400 italic">Không có văn bản đính kèm</p>
            )}
          </div>

          {/* Ghi chú */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Ghi chú
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {task.notes || 'Không có ghi chú thêm.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Đóng
          </button>

          {canEdit && onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
            >
              Chỉnh sửa công việc
            </button>
          )}
        </div>
      </div>
    </div>
  );
};