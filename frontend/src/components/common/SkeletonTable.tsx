import React from 'react';

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, cols = 8 }) => {
  return (
    <div className="w-full animate-pulse space-y-3 p-4">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-full mb-4" />
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center space-x-4 py-2 border-b border-slate-100 dark:border-slate-800/60">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className={`h-4 bg-slate-200 dark:bg-slate-800 rounded ${
                cIdx === 0 ? 'w-8' : cIdx === 1 ? 'w-48' : 'flex-1'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};