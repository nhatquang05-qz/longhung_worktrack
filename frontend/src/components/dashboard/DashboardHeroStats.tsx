import React from 'react';
import { ListTodo, CircleDashed, Clock, CheckCircle2, AlertTriangle, Flame } from 'lucide-react';
import { DashboardStats } from '../../types/dashboard';

export type StatFilterType = 'ALL' | 'OVERDUE' | 'WARNING' | 'IN_PROGRESS' | 'TODO' | 'COMPLETED';

interface DashboardHeroStatsProps {
  stats: DashboardStats;
  selectedFilter?: StatFilterType;
  onSelectFilter?: (type: StatFilterType) => void;
}

export const DashboardHeroStats: React.FC<DashboardHeroStatsProps> = ({
  stats,
  selectedFilter = 'ALL',
  onSelectFilter,
}) => {
  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedCount / stats.totalTasks) * 100)
      : 0;

  const handleFilterClick = (type: StatFilterType) => {
    if (!onSelectFilter) return;
    if (selectedFilter === type) {
      onSelectFilter('ALL');
    } else {
      onSelectFilter(type);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Ô Hero Lớn: Tổng quan & Cảnh báo khẩn cấp (Chiếm 7 cột trên Desktop) */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div
          onClick={() => handleFilterClick('ALL')}
          className={`flex items-start justify-between p-2 rounded-xl transition cursor-pointer select-none ${
            selectedFilter === 'ALL'
              ? 'ring-2 ring-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Khối lượng công việc {selectedFilter === 'ALL' && '● Đang xem tất cả'}
            </span>
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {stats.totalTasks}
              </span>
              <span className="text-sm font-medium text-slate-500">công việc ghi nhận</span>
            </div>
          </div>

          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ListTodo size={24} />
          </div>
        </div>

        {/* Thanh Progress Tỷ lệ hoàn thành */}
        <div className="my-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Tỷ lệ hoàn thành mục tiêu
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {completionRate}% ({stats.completedCount}/{stats.totalTasks})
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* 2 Khối cảnh báo khẩn cấp bên trong Hero */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div
            onClick={() => handleFilterClick('OVERDUE')}
            className={`flex items-center space-x-3 p-3 rounded-xl border transition cursor-pointer select-none ${
              selectedFilter === 'OVERDUE'
                ? 'ring-2 ring-rose-500 bg-rose-100/70 dark:bg-rose-900/50 border-transparent shadow-sm'
                : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/40 hover:bg-rose-100/50'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                Quá hạn {selectedFilter === 'OVERDUE' && '●'}
              </p>
              <p className="text-xl font-bold text-rose-800 dark:text-rose-300 leading-tight">
                {stats.overdueCount}
              </p>
            </div>
          </div>

          <div
            onClick={() => handleFilterClick('WARNING')}
            className={`flex items-center space-x-3 p-3 rounded-xl border transition cursor-pointer select-none ${
              selectedFilter === 'WARNING'
                ? 'ring-2 ring-amber-500 bg-amber-100/70 dark:bg-amber-900/50 border-transparent shadow-sm'
                : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40 hover:bg-amber-100/50'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Flame size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                Gấp trong 24h {selectedFilter === 'WARNING' && '●'}
              </p>
              <p className="text-xl font-bold text-amber-800 dark:text-amber-300 leading-tight">
                {stats.warningCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cột 3 Card Trạng Thái Chi Tiết (Chiếm 5 cột trên Desktop) */}
      <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
        {/* Đang làm */}
        <div
          onClick={() => handleFilterClick('IN_PROGRESS')}
          className={`bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm flex items-center justify-between transition cursor-pointer select-none ${
            selectedFilter === 'IN_PROGRESS'
              ? 'ring-2 ring-blue-500 border-transparent shadow-md bg-blue-50/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Clock size={19} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Đang thực hiện {selectedFilter === 'IN_PROGRESS' && '●'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Nhiệm vụ đang chạy</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
            {stats.inProgressCount}
          </span>
        </div>

        {/* Chưa làm */}
        <div
          onClick={() => handleFilterClick('TODO')}
          className={`bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm flex items-center justify-between transition cursor-pointer select-none ${
            selectedFilter === 'TODO'
              ? 'ring-2 ring-slate-400 border-transparent shadow-md bg-slate-50/50'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
              <CircleDashed size={19} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Chưa làm {selectedFilter === 'TODO' && '●'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Chờ tiếp nhận & xử lý</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-700 dark:text-slate-300 font-mono">
            {stats.todoCount}
          </span>
        </div>

        {/* Đã hoàn thành */}
        <div
          onClick={() => handleFilterClick('COMPLETED')}
          className={`bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm flex items-center justify-between transition cursor-pointer select-none ${
            selectedFilter === 'COMPLETED'
              ? 'ring-2 ring-emerald-500 border-transparent shadow-md bg-emerald-50/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Đã hoàn thành {selectedFilter === 'COMPLETED' && '●'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Nhiệm vụ đã đóng</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.completedCount}
          </span>
        </div>
      </div>
    </div>
  );
};