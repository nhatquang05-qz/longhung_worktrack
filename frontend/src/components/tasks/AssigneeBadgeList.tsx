import React, { useState, useRef, useEffect } from 'react';
import { TaskAssignee } from '../../types/task';

interface AssigneeBadgeListProps {
  assignees: TaskAssignee[];
}

export const AssigneeBadgeList: React.FC<AssigneeBadgeListProps> = ({ assignees }) => {
  const [showAll, setShowAll] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowAll(false);
      }
    };
    if (showAll) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAll]);

  if (!assignees || assignees.length === 0) {
    return <span className="text-xs text-slate-400">Chưa có người</span>;
  }

  const firstTwo = assignees.slice(0, 2);
  const remainingCount = assignees.length - 2;

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="relative inline-flex items-center flex-wrap gap-1">
      {firstTwo.map((a, idx) => (
        <span
          key={idx}
          className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
            a.isAccount
              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
          }`}
          title={a.isAccount ? `Tài khoản: @${a.username || ''}` : 'Người ngoài / Phòng ban'}
        >
          <span className="w-4 h-4 rounded-full bg-slate-300/60 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold">
            {getInitials(a.fullName)}
          </span>
          <span className="truncate max-w-[100px]">{a.fullName}</span>
        </span>
      ))}

      {remainingCount > 0 && (
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          >
            +{remainingCount}
          </button>

          {showAll && (
            <div className="absolute left-0 bottom-full mb-1 z-30 w-56 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-1 text-xs">
              <div className="font-semibold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-100 dark:border-slate-800">
                Bộ phận thực hiện ({assignees.length})
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1">
                {assignees.map((a, idx) => (
                  <div key={idx} className="flex items-center justify-between py-0.5">
                    <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                      {a.fullName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {a.isAccount ? 'Nội bộ' : 'Ngoài'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};