import React from 'react';
import { ExternalLink, Edit3, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { TaskItem, TaskStatus } from '../../types/task';
import { formatDateTime, checkDeadlineStatus } from '../../utils/dateUtils';
import { AssigneeBadgeList } from './AssigneeBadgeList';
import { useAuth } from '../../contexts/AuthContext';
import { SkeletonTable } from '../common/SkeletonTable';
import { EmptyState } from '../common/EmptyState';

interface TaskTableProps {
  tasks: TaskItem[];
  page: number;
  limit: number;
  loading: boolean;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  onSelectTask?: (task: TaskItem) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  page,
  limit,
  loading,
  onEdit,
  onDelete,
  onSelectTask,
}) => {
  const { user } = useAuth();

  const renderStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Chưa làm
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Đang làm
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Đã hoàn thành
          </span>
        );
    }
  };

  const renderDeadlineWarning = (endTime: string, status: TaskStatus) => {
    const deadlineState = checkDeadlineStatus(endTime, status);
    if (deadlineState === 'OVERDUE') {
      return (
        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
          <AlertTriangle size={12} />
          <span>Quá hạn</span>
        </span>
      );
    }
    if (deadlineState === 'WARNING') {
      return (
        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
          <Clock size={12} />
          <span>Sắp đến hạn</span>
        </span>
      );
    }
    return null;
  };

  const canModifyTask = (task: TaskItem): boolean => {
    if (!user) return false;
    if (user.isAdmin) return true;
    return task.assignees.some((a) => a.userId === user.id);
  };

  if (loading) {
    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <SkeletonTable rows={6} cols={7} />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <EmptyState
          title="Chưa có công việc nào"
          description="Hiện tại không tìm thấy công việc nào phù hợp với điều kiện lọc."
        />
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm min-w-[1100px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
              <th className="py-3 px-3 w-12 text-center">STT</th>
              <th className="py-3 px-4 min-w-[220px]">Nội dung</th>
              <th className="py-3 px-4 min-w-[180px]">Bộ phận thực hiện</th>
              <th className="py-3 px-3 min-w-[130px]">Bắt đầu</th>
              <th className="py-3 px-3 min-w-[130px]">Kết thúc</th>
              <th className="py-3 px-3 text-center min-w-[110px]">Tiến độ</th>
              <th className="py-3 px-3 min-w-[130px]">Ngày hoàn thành</th>
              <th className="py-3 px-3 min-w-[130px]">Người nộp</th>
              <th className="py-3 px-3 text-center min-w-[90px]">Hình thức</th>
              <th className="py-3 px-3 text-center min-w-[110px]">Đính kèm</th>
              <th className="py-3 px-4 min-w-[150px]">Ghi chú</th>
              <th className="py-3 px-3 text-right sticky right-0 bg-slate-50 dark:bg-slate-800/80 w-20">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((task, index) => {
              const stt = (page - 1) * limit + index + 1;
              const editable = canModifyTask(task);

              return (
                <tr
                  key={task.id}
                  onClick={() => onSelectTask && onSelectTask(task)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer group"
                >
                  <td className="py-3 px-3 text-center text-slate-400 text-xs font-mono">
                    {stt}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-100 leading-snug">
                    <span className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                      {task.title}
                    </span>
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <AssigneeBadgeList assignees={task.assignees} />
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-300">
                    {formatDateTime(task.startTime)}
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-300">
                    <div>{formatDateTime(task.endTime)}</div>
                    {renderDeadlineWarning(task.endTime, task.status)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {renderStatusBadge(task.status)}
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-300">
                    {formatDateTime(task.completedAt)}
                  </td>
                  <td className="py-3 px-3 text-xs font-medium text-slate-700 dark:text-slate-200">
                    {task.submitterName || <span className="text-slate-400 italic">-</span>}
                  </td>
                  <td className="py-3 px-3 text-center text-xs text-slate-600 dark:text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                      {task.format}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    {task.driveUrl ? (
                      <a
                        href={task.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                      >
                        <span>Xem</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-[180px] truncate" title={task.notes || ''}>
                    {task.notes || '-'}
                  </td>
                  <td
                    className="py-3 px-3 text-right sticky right-0 bg-white group-hover:bg-slate-50/90 dark:bg-slate-900 dark:group-hover:bg-slate-800/90 transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {editable ? (
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => onEdit(task)}
                          title="Chỉnh sửa công việc"
                          className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(task)}
                          title="Xóa công việc"
                          className="p-1 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Chỉ xem</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};