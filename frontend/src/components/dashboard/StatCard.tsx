import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'default' | 'todo' | 'inProgress' | 'completed' | 'warning' | 'overdue';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, variant }) => {
  const variantStyles = {
    default: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
      text: 'text-slate-800 dark:text-slate-100',
      iconBox: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
    },
    todo: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
      text: 'text-slate-700 dark:text-slate-200',
      iconBox: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    },
    inProgress: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-blue-100 dark:border-blue-900/40',
      text: 'text-blue-600 dark:text-blue-400',
      iconBox: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
    },
    completed: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-emerald-100 dark:border-emerald-900/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      iconBox: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    },
    warning: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-amber-100 dark:border-amber-900/40',
      text: 'text-amber-600 dark:text-amber-400',
      iconBox: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    },
    overdue: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-rose-100 dark:border-rose-900/40',
      text: 'text-rose-600 dark:text-rose-400',
      iconBox: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
    },
  }[variant];

  return (
    <div className={`p-4 rounded-xl border ${variantStyles.border} ${variantStyles.bg} shadow-sm flex items-center justify-between transition hover:shadow-md`}>
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </p>
        <p className={`text-2xl font-bold tracking-tight ${variantStyles.text}`}>
          {value}
        </p>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${variantStyles.iconBox}`}>
        <Icon size={22} />
      </div>
    </div>
  );
};