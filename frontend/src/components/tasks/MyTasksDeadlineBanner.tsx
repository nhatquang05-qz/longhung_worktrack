import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { TaskItem } from '../../types/task';
import { checkDeadlineStatus, formatDateTime } from '../../utils/dateUtils';

interface MyTasksDeadlineBannerProps {
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
}

export const MyTasksDeadlineBanner: React.FC<MyTasksDeadlineBannerProps> = ({
  tasks,
  onSelectTask,
}) => {
  // Lọc các task chưa hoàn thành cần chú ý
  const overdueTasks = tasks.filter(
    (t) => checkDeadlineStatus(t.endTime, t.status) === 'OVERDUE'
  );
  const warningTasks = tasks.filter(
    (t) => checkDeadlineStatus(t.endTime, t.status) === 'WARNING'
  );

  const totalUrgent = overdueTasks.length + warningTasks.length;

  // Nếu không có task nào gấp hoặc quá hạn
  if (totalUrgent === 0) {
    return (
      <div className="flex items-center space-x-3 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <p className="font-semibold text-sm">Tiến độ an toàn</p>
          <p className="text-emerald-600 dark:text-emerald-400">
            Bạn hiện không có công việc nào bị quá hạn hoặc sắp hết hạn trong 24 giờ tới.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-amber-200 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/90 via-rose-50/60 to-white dark:from-amber-950/30 dark:via-rose-950/20 dark:to-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 dark:border-amber-900/40 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-tight">
              Cảnh báo tiến độ nhiệm vụ cần xử lý gấp
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bạn có <strong className="text-rose-600 dark:text-rose-400">{overdueTasks.length}</strong> công việc quá hạn và <strong className="text-amber-600 dark:text-amber-400">{warningTasks.length}</strong> công việc sắp đến hạn chót.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {overdueTasks.length > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs">
              {overdueTasks.length} Quá hạn
            </span>
          )}
          {warningTasks.length > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs">
              {warningTasks.length} Sắp đến hạn
            </span>
          )}
        </div>
      </div>

      {/* Danh sách các task khẩn cấp dạng thẻ ngang cuộn nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
        {[...overdueTasks, ...warningTasks].slice(0, 6).map((task) => {
          const isOverdue = checkDeadlineStatus(task.endTime, task.status) === 'OVERDUE';
          return (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl shadow-2xs flex items-center justify-between cursor-pointer transition group"
            >
              <div className="space-y-1 min-w-0 pr-2">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isOverdue
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
                    }`}
                  >
                    {isOverdue ? <AlertTriangle size={10} className="mr-1" /> : <Clock size={10} className="mr-1" />}
                    {isOverdue ? 'Quá hạn' : 'Gấp trong 24h'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Hạn: {formatDateTime(task.endTime)}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {task.title}
                </p>
              </div>

              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 flex items-center justify-center shrink-0 transition">
                <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};