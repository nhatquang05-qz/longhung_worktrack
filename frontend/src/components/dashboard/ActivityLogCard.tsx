import React from 'react';
import { History, PlusCircle, Edit3, Trash2, ArrowRight } from 'lucide-react';
import { TaskActivity } from '../../types/activity';
import { formatDateTime } from '../../utils/dateUtils';

interface ActivityLogCardProps {
  activities: TaskActivity[];
  loading: boolean;
  onSelectActivity?: (activity: TaskActivity) => void;
}

export const ActivityLogCard: React.FC<ActivityLogCardProps> = ({
  activities,
  loading,
  onSelectActivity,
}) => {
  const getActionBadge = (action: TaskActivity['action']) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <PlusCircle size={12} className="mr-1" />
            Tạo mới
          </span>
        );
      case 'UPDATE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Edit3 size={12} className="mr-1" />
            Chỉnh sửa
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <Trash2 size={12} className="mr-1" />
            Đã xóa
          </span>
        );
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
      <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
          <History size={17} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Nhật Ký & Lịch Sử Thao Tác
          </h3>
          <p className="text-xs text-slate-400">
            Theo dõi mọi chỉnh sửa (Click vào dòng để xem đối chiếu Hàng gốc vs Hàng mới)
          </p>
        </div>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-6 text-xs text-slate-400">
            Đang tải lịch sử thao tác...
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 italic">
            Chưa có thao tác nào được ghi nhận.
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectActivity && onSelectActivity(item)}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/70 text-xs transition hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer group"
            >
              <div className="space-y-1 min-w-0 pr-3">
                <div className="flex items-center space-x-2">
                  {getActionBadge(item.action)}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.user_name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatDateTime(item.created_at)}
                  </span>
                </div>
                <p className="font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {item.task_title}
                </p>
                {item.details && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate max-w-xl">
                    {item.details}
                  </p>
                )}
              </div>

              <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center justify-center shrink-0 transition">
                <ArrowRight size={13} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};