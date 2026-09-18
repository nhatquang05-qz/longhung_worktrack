import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Bell, User as UserIcon, LogOut, KeyRound } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Topbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Quản Lý Công Việc
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          aria-label="Notifications"
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 relative transition"
        >
          <Bell size={20} />
        </button>

        {/* User Dropdown */}
        <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs tracking-wider">
              {getInitials(user?.fullName)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-none">
                {user?.fullName || 'Người dùng'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 leading-none">
                {user?.isAdmin ? 'Quản trị viên' : `@${user?.username}`}
              </div>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1 z-30 text-sm">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-400 truncate">@{user?.username}</p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/change-password');
                }}
                className="w-full px-4 py-2 text-left flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
              >
                <KeyRound size={16} />
                <span>Đổi mật khẩu</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left flex items-center space-x-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              >
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;