import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, ArrowRight, BellOff } from 'lucide-react';
import { AppNotification } from '../../types/notification';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleSelect = () => {
    onClose();
    navigate('/my-tasks');
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden text-sm">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          Thông báo hạn công việc
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-medium">
          {notifications.length} cần chú ý
        </span>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <BellOff size={28} className="mx-auto opacity-50" />
            <p className="text-xs">Không có công việc nào sắp đến hạn hoặc quá hạn</p>
          </div>
        ) : (
          notifications.map((n) => {
            const isOverdue = n.type === 'OVERDUE';
            return (
              <div
                key={n.id}
                onClick={handleSelect}
                className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer flex items-start space-x-3"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isOverdue
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                  }`}
                >
                  {isOverdue ? <AlertTriangle size={16} /> : <Clock size={16} />}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {n.title}
                  </p>
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
            );
          })
        )}
      </div>

      <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center">
        <button
          onClick={() => {
            onClose();
            navigate('/notifications');
          }}
          className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center space-x-1"
        >
          <span>Xem tất cả cảnh báo</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};