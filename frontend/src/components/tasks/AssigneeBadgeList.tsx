import React from 'react';
import { TaskAssignee } from '../../types/task';

interface AssigneeBadgeListProps {
  assignees: TaskAssignee[];
}

export const AssigneeBadgeList: React.FC<AssigneeBadgeListProps> = ({ assignees }) => {
  if (!assignees || assignees.length === 0) {
    return <span className="text-xs text-slate-400">Chưa có người</span>;
  }

  // Lấy 2 chữ cái đầu (VD: Nguyễn Nhật Quang -> NQ, Mai Liễu -> ML)
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Lấy tên gọi cuối cùng (VD: "Nguyễn Thị Liễu" -> "Liễu", "Trần Văn Lâm" -> "Lâm")
  const getLastName = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    return parts[parts.length - 1];
  };

  return (
    <div className="flex items-center flex-wrap gap-1 max-w-[260px]">
      {assignees.map((a, idx) => (
        <span
          key={idx}
          className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
            a.isAccount
              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
          }`}
          title={a.fullName + (a.isAccount ? ` (@${a.username || ''})` : ' (Khác / Phòng ban)')}
        >
          <span className="w-4 h-4 rounded-full bg-slate-300/60 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold shrink-0">
            {getInitials(a.fullName)}
          </span>
          <span className="truncate max-w-[85px] font-semibold">
            {getLastName(a.fullName)}
          </span>
        </span>
      ))}
    </div>
  );
};