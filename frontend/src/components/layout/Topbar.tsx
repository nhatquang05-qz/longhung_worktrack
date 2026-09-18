import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Bell, LogOut, KeyRound, Menu, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { AppNotification } from '../../types/notification';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

interface TopbarProps {
  onMenuToggle?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Đồng hồ số thời gian thực
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatClock = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();

    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayName = daysOfWeek[d.getDay()];

    return {
      time: `${hours}:${minutes}:${seconds}`,
      date: `${dayName}, ${day}/${month}/${year}`,
    };
  };

  const { time: timeStr, date: dateStr } = formatClock(currentTime);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = (await api.get('/notifications')) as unknown as {
        success: boolean;
        data: AppNotification[];
        total: number;
      };
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Không thể lấy danh sách thông báo', err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
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

  const hasOverdue = notifications.some((n) => n.type === 'OVERDUE');

  return (
    <header className="h-16 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuToggle}
          aria-label="Open mobile navigation"
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Menu size={20} />
        </button>

        <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 hidden sm:inline">
          Quản Lý Công Việc
        </span>
      </div>

      {/* Đồng hồ số thời gian thực */}
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-inner">
        <Clock size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 tracking-wider">
          {timeStr}
        </span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium pl-1 border-l border-slate-300 dark:border-slate-700 hidden md:inline">
          {dateStr}
        </span>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen((prev) => !prev);
              if (!notifOpen) fetchNotifications();
            }}
            aria-label="Notifications"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 relative transition"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span
                className={`absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse ${
                  hasOverdue ? 'bg-rose-600' : 'bg-amber-500'
                }`}
              >
                {notifications.length > 99 ? '99+' : notifications.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotificationDropdown
              notifications={notifications}
              onClose={() => setNotifOpen(false)}
            />
          )}
        </div>

        <div className="relative pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-2 sm:space-x-2.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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