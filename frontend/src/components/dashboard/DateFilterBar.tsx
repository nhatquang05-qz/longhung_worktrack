import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, Info } from 'lucide-react';
import { ManagedUser } from '../../types/user';
import { DatePreset } from '../../utils/filterUtils';
import api from '../../services/api';
import { ApiResponse } from '../../types/api';

export interface TaskFilterParams {
  search: string;
  status: string;
  assigneeId: string;
  preset: DatePreset;
  timeField: 'end_time' | 'start_time';
  customStart: string;
  customEnd: string;
}

interface DateFilterBarProps {
  filters: TaskFilterParams;
  onChange: (newFilters: TaskFilterParams) => void;
  showAssigneeFilter?: boolean;
}

const VietDateInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const formatDisplay = (isoDate: string) => {
    if (!isoDate) return 'dd/mm/yyyy';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
  };

  const handleContainerClick = () => {
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker();
      } else {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-slate-500 font-medium shrink-0">{label}</span>
      <div
        onClick={handleContainerClick}
        className="relative flex items-center px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition text-xs"
      >
        <span
          className={`font-mono ${
            value
              ? 'text-slate-800 dark:text-slate-100 font-medium'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          {formatDisplay(value)}
        </span>
        <Calendar size={13} className="ml-2 text-slate-400 shrink-0" />

        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
          tabIndex={-1}
        />
      </div>
    </div>
  );
};

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  filters,
  onChange,
  showAssigneeFilter = true,
}) => {
  const [availableUsers, setAvailableUsers] = useState<ManagedUser[]>([]);

  useEffect(() => {
    if (!showAssigneeFilter) return;
    const fetchUsers = async () => {
      try {
        const res = (await api.get('/users')) as unknown as ApiResponse<ManagedUser[]>;
        if (res.success && res.data) {
          setAvailableUsers(res.data);
        }
      } catch (err) {
        console.error('Không thể nạp danh sách user cho bộ lọc', err);
      }
    };
    fetchUsers();
  }, [showAssigneeFilter]);

  const update = (patch: Partial<TaskFilterParams>) => {
    onChange({ ...filters, ...patch });
  };

  const presets: { id: DatePreset; label: string }[] = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'THIS_WEEK', label: 'Tuần này' },
    { id: 'THIS_MONTH', label: 'Tháng này' },
    { id: 'THIS_YEAR', label: 'Năm nay' },
    { id: 'CUSTOM', label: 'Khoảng ngày' },
  ];

  const getPresetDescription = (preset: DatePreset) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');

    if (preset === 'THIS_WEEK') {
      const dayOfWeek = now.getDay();
      const distanceToMonday = (dayOfWeek + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - distanceToMonday);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const mStr = `${pad(monday.getDate())}/${pad(monday.getMonth() + 1)}/${monday.getFullYear()}`;
      const sStr = `${pad(sunday.getDate())}/${pad(sunday.getMonth() + 1)}/${sunday.getFullYear()}`;
      return `Thứ Hai (${mStr}) ➔ Chủ Nhật (${sStr})`;
    }

    if (preset === 'THIS_MONTH') {
      const month = pad(now.getMonth() + 1);
      const year = now.getFullYear();
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      return `Tháng ${month}/${year} (01/${month} ➔ ${lastDay}/${month}/${year})`;
    }

    if (preset === 'THIS_YEAR') {
      const year = now.getFullYear();
      return `Năm ${year} (01/01/${year} ➔ 31/12/${year})`;
    }

    return null;
  };

  const presetDesc = getPresetDescription(filters.preset);

  return (
    <div className="space-y-3 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      {/* Hàng 1: Preset Buttons & Time field */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => update({ preset: p.id })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  filters.preset === p.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {presetDesc && (
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 text-[11px] font-medium animate-in fade-in duration-200">
              <Info size={13} className="shrink-0 text-blue-500" />
              <span>{presetDesc}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
          <Calendar size={14} />
          <span>Lọc theo:</span>
          <select
            value={filters.timeField}
            onChange={(e) => update({ timeField: e.target.value as any })}
            className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:outline-none dark:text-slate-100 font-medium"
          >
            <option value="end_time">Thời hạn (Deadline)</option>
            <option value="start_time">Ngày bắt đầu</option>
          </select>
        </div>
      </div>

      {/* Hàng 2: Chọn khoảng ngày tự do */}
      {filters.preset === 'CUSTOM' && (
        <div className="flex flex-wrap items-center gap-4 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs border border-slate-200 dark:border-slate-700 animate-in fade-in duration-150">
          <VietDateInput
            label="Từ ngày:"
            value={filters.customStart}
            onChange={(val) => update({ customStart: val })}
          />
          <VietDateInput
            label="Đến ngày:"
            value={filters.customEnd}
            onChange={(val) => update({ customEnd: val })}
          />
        </div>
      )}

      {/* Hàng 3: Ô tìm kiếm + Lọc trạng thái + Lọc thành viên */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Tìm theo tên công việc, người thực hiện, người nộp..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => update({ status: e.target.value })}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
        >
          <option value="">-- Tất cả trạng thái --</option>
          <option value="TODO">Chưa làm</option>
          <option value="IN_PROGRESS">Đang làm</option>
          <option value="COMPLETED">Đã hoàn thành</option>
        </select>

        {showAssigneeFilter && (
          <select
            value={filters.assigneeId}
            onChange={(e) => update({ assigneeId: e.target.value })}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
          >
            <option value="">-- Tất cả thành viên --</option>
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};