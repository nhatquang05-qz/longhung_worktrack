import React from 'react';
import { ExternalLink, Edit3, Trash2, AlertTriangle, Clock, ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
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
  total?: number;
  totalPages?: number;
  loading: boolean;
  onPageChange?: (newPage: number) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  onSelectTask?: (task: TaskItem) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  page,
  limit,
  total = 0,
  totalPages = 1,
  loading,
  onPageChange,
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
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700">
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

  const renderFormatBadges = (formatStr?: string | null) => {
    if (!formatStr || !formatStr.trim()) {
      return <span className="text-xs text-slate-400 italic">-</span>;
    }

    const formats = formatStr
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    return (
      <div className="flex flex-wrap gap-1 justify-center items-center max-w-[180px] mx-auto">
        {formats.map((item, idx) => (
          <span
            key={idx}
            className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-medium leading-tight shadow-2xs whitespace-nowrap"
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  const getRowColorClasses = (task: TaskItem) => {
    if (task.status === 'COMPLETED') {
      return {
        row: 'bg-emerald-50/60 hover:bg-emerald-100/60 dark:bg-emerald-950/25 dark:hover:bg-emerald-950/40',
        stickyAction: 'bg-emerald-50/95 group-hover:bg-emerald-100/90 dark:bg-[#062419] dark:group-hover:bg-[#083022]',
      };
    }

    const deadlineState = checkDeadlineStatus(task.endTime, task.status);

    if (deadlineState === 'OVERDUE') {
      return {
        row: 'bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/35 dark:hover:bg-rose-950/50',
        stickyAction: 'bg-rose-50/95 group-hover:bg-rose-100/90 dark:bg-[#2b0c10] dark:group-hover:bg-[#381016]',
      };
    }

    if (deadlineState === 'WARNING') {
      return {
        row: 'bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/30 dark:hover:bg-amber-950/45',
        stickyAction: 'bg-amber-50/95 group-hover:bg-amber-100/90 dark:bg-[#2b1b08] dark:group-hover:bg-[#38230a]',
      };
    }

    return {
      row: 'bg-white hover:bg-slate-50/80 dark:bg-slate-900 dark:hover:bg-slate-800/50',
      stickyAction: 'bg-white group-hover:bg-slate-50 dark:bg-slate-900 dark:group-hover:bg-slate-800',
    };
  };

  const canModifyTask = (task: TaskItem): boolean => {
    if (!user) return false;
    if (user.isAdmin) return true;
    return task.createdBy === user.id || task.assignees.some((a) => a.userId === user.id);
  };

  if (loading) {
    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <SkeletonTable rows={6} cols={6} />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <EmptyState
          title="Chưa có công việc nào"
          description="Hiện tại không tìm thấy công việc nào phù hợp với điều kiện lọc."
        />
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col">
      {/* 1. GIAO DIỆN DI ĐỘNG: Có khoảng cách tách rời & lề đậm rõ ràng */}
      <div className="block md:hidden p-3 space-y-3 bg-slate-50/70 dark:bg-slate-950/40">
        {tasks.map((task, index) => {
          const stt = (page - 1) * limit + index + 1;
          const editable = canModifyTask(task);
          const deadlineAlert = renderDeadlineWarning(task.endTime, task.status);

          return (
            <div
              key={task.id}
              onClick={() => onSelectTask && onSelectTask(task)}
              className="p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-300/80 dark:border-slate-700/80 rounded-xl shadow-xs transition active:bg-slate-50 dark:active:bg-slate-800/60 cursor-pointer space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2">
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    #{stt}
                  </span>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                    {task.title}
                  </h4>
                </div>
                <div className="shrink-0">{renderStatusBadge(task.status)}</div>
              </div>

              {/* Thông tin hạn chót & người nộp */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/70">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>Hạn chót:</span>
                  </span>
                  <div className="font-medium text-slate-700 dark:text-slate-200">
                    {formatDateTime(task.endTime)}
                  </div>
                  {deadlineAlert}
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <User size={12} />
                    <span>Người nộp:</span>
                  </span>
                  <div className="font-medium text-slate-700 dark:text-slate-200 truncate">
                    {task.submitterName || 'Chưa nộp'}
                  </div>
                </div>
              </div>

              {/* Bộ phận thực hiện & Hình thức */}
              <div className="space-y-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <AssigneeBadgeList assignees={task.assignees} />
                </div>
                {task.format && (
                  <div className="flex items-center space-x-1.5">
                    {renderFormatBadges(task.format)}
                  </div>
                )}
              </div>

              {/* Footer Card: File đính kèm & Nút sửa/xóa */}
              <div
                className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/80"
                onClick={(e) => e.stopPropagation()}
              >
                {task.driveUrl ? (
                  <a
                    href={task.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline p-1"
                  >
                    <span>Xem file đính kèm</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Không có file đính kèm</span>
                )}

                {editable ? (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEdit(task)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                      title="Chỉnh sửa"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(task)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      title="Xóa"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Chỉ xem</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. GIAO DIỆN DESKTOP: Bảng Table Ngang Đầy Đủ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm min-w-[1150px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
              <th className="py-3 px-3 w-12 text-center">STT</th>
              <th className="py-3 px-4 min-w-[200px] text-left">Nội dung</th>
              <th className="py-3 px-4 min-w-[180px] text-left">Bộ phận thực hiện</th>
              <th className="py-3 px-3 min-w-[130px] text-left">Bắt đầu</th>
              <th className="py-3 px-3 min-w-[130px] text-left">Kết thúc</th>
              <th className="py-3 px-3 text-center min-w-[110px]">Tiến độ</th>
              <th className="py-3 px-3 min-w-[130px] text-left">Ngày hoàn thành</th>
              <th className="py-3 px-3 min-w-[130px] text-left">Người nộp</th>
              <th className="py-3 px-3 text-center min-w-[140px]">Hình thức</th>
              <th className="py-3 px-3 text-center min-w-[110px]">Đính kèm</th>
              <th className="py-3 px-4 min-w-[150px] text-left">Ghi chú</th>
              <th className="py-3 px-3 text-right sticky right-0 bg-slate-50 dark:bg-slate-800/80 w-20">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
            {tasks.map((task, index) => {
              const stt = (page - 1) * limit + index + 1;
              const editable = canModifyTask(task);
              const colorClasses = getRowColorClasses(task);

              return (
                <tr
                  key={task.id}
                  onClick={() => onSelectTask && onSelectTask(task)}
                  className={`${colorClasses.row} transition cursor-pointer group`}
                >
                  <td className="py-3 px-3 text-center text-slate-400 text-xs font-mono">
                    {stt}
                  </td>
                  <td className="py-3 px-4 text-left font-medium text-slate-800 dark:text-slate-100 leading-snug max-w-[280px]">
                    <span className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                      {task.title}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-left" onClick={(e) => e.stopPropagation()}>
                    <AssigneeBadgeList assignees={task.assignees} />
                  </td>
                  <td className="py-3 px-3 text-left text-xs text-slate-600 dark:text-slate-300">
                    {formatDateTime(task.startTime)}
                  </td>
                  <td className="py-3 px-3 text-left text-xs text-slate-600 dark:text-slate-300">
                    <div>{formatDateTime(task.endTime)}</div>
                    {renderDeadlineWarning(task.endTime, task.status)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {renderStatusBadge(task.status)}
                  </td>
                  <td className="py-3 px-3 text-left text-xs text-slate-600 dark:text-slate-300">
                    {formatDateTime(task.completedAt)}
                  </td>
                  <td className="py-3 px-3 text-left text-xs font-medium text-slate-700 dark:text-slate-200">
                    {task.submitterName || <span className="text-slate-400 italic">-</span>}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {renderFormatBadges(task.format)}
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
                  <td className="py-3 px-4 text-left text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={task.notes || ''}>
                    {task.notes || '-'}
                  </td>
                  <td
                    className={`py-3 px-3 text-right sticky right-0 ${colorClasses.stickyAction} transition`}
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

      {/* Phân trang Responsive */}
      {totalPages > 1 && onPageChange && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Hiển thị <span className="font-semibold text-slate-700 dark:text-slate-200">{(page - 1) * limit + 1}</span> -{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {Math.min(page * limit, total || tasks.length)}
            </span>{' '}
            trong tổng số <span className="font-semibold text-slate-700 dark:text-slate-200">{total || tasks.length}</span> công việc
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 sm:p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs text-slate-600 dark:text-slate-300 px-3 font-semibold">
              Trang {page} / {totalPages}
            </span>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 sm:p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Trang sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};