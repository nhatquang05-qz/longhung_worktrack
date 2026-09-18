import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, ListTodo, Users, Bell, LucideIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems: NavItem[] = [
    { to: '/', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tất cả công việc', icon: ListTodo },
    { to: '/my-tasks', label: 'Công việc của tôi', icon: CheckSquare },
    { to: '/notifications', label: 'Thông báo', icon: Bell },
    { to: '/users', label: 'Quản lý tài khoản', icon: Users, adminOnly: true },
  ];

  const visibleItems = navItems.filter((item) => !item.adminOnly || user?.isAdmin);

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-screen sticky top-0">
      <div className="h-16 px-6 flex items-center border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-lg font-bold tracking-tight text-blue-600 dark:text-blue-400">
          WorkTrack
        </h1>
      </div>

      <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
        Phiên bản 1.0.0
      </div>
    </aside>
  );
};

export default Sidebar;