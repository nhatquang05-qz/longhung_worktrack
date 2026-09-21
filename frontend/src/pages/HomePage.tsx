import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../services/api';
import { DashboardStats } from '../types/dashboard';
import { TaskItem, TaskPagination } from '../types/task';
import { TaskActivity } from '../types/activity';
import { DashboardHeroStats, StatFilterType } from '../components/dashboard/DashboardHeroStats';
import { TaskTable } from '../components/tasks/TaskTable';
import { TaskModal } from '../components/tasks/TaskModal';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { DeleteConfirmModal } from '../components/tasks/DeleteConfirmModal';
import { DateFilterBar, TaskFilterParams } from '../components/dashboard/DateFilterBar';
import { ActivityLogCard } from '../components/dashboard/ActivityLogCard';
import { ActivityDiffModal } from '../components/dashboard/ActivityDiffModal';
import { calculatePresetDates } from '../utils/filterUtils';
import { checkDeadlineStatus } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';

const defaultFilters: TaskFilterParams = {
  search: '',
  status: '',
  assigneeId: '',
  preset: 'ALL',
  timeField: 'end_time',
  customStart: '',
  customEnd: '',
};

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    todoCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    warningCount: 0,
    overdueCount: 0,
  });

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // State nhận diện thẻ thống kê đang được click
  const [statFilter, setStatFilter] = useState<StatFilterType>('ALL');

  const [selectedActivity, setSelectedActivity] = useState<TaskActivity | null>(null);

  const [pagination, setPagination] = useState<TaskPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState<TaskFilterParams>(defaultFilters);
  const [loading, setLoading] = useState(true);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [detailTask, setDetailTask] = useState<TaskItem | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);

  const getDateParams = useCallback(() => {
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (filters.preset === 'CUSTOM') {
      if (filters.customStart) startDate = `${filters.customStart} 00:00:00`;
      if (filters.customEnd) endDate = `${filters.customEnd} 23:59:59`;
    } else if (filters.preset !== 'ALL') {
      const dates = calculatePresetDates(filters.preset);
      startDate = dates.startDate;
      endDate = dates.endDate;
    }

    return { startDate, endDate };
  }, [filters.preset, filters.customStart, filters.customEnd]);

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        timeField: filters.timeField,
      });

      if (filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);

      const { startDate, endDate } = getDateParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = (await api.get(`/dashboard/stats?${params.toString()}`)) as unknown as {
        success: boolean;
        data: DashboardStats;
      };
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Không thể lấy thống kê Dashboard', err);
    }
  }, [filters.timeField, filters.search, filters.assigneeId, getDateParams]);

  const fetchActivities = useCallback(async () => {
    setActivityLoading(true);
    try {
      const params = new URLSearchParams({ limit: '20' });

      if (filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);

      const { startDate, endDate } = getDateParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = (await api.get(`/dashboard/activities?${params.toString()}`)) as unknown as {
        success: boolean;
        data: TaskActivity[];
      };
      if (res.success && res.data) {
        setActivities(res.data);
      }
    } catch (err) {
      console.error('Không thể lấy lịch sử hoạt động', err);
    } finally {
      setActivityLoading(false);
    }
  }, [filters.search, filters.assigneeId, getDateParams]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      // Khi lọc theo Quá hạn hoặc Gấp 24h, tải nhiều task hơn (limit: 50) để kiểm tra deadline chuẩn xác
      const fetchLimit = statFilter === 'OVERDUE' || statFilter === 'WARNING' ? '50' : pagination.limit.toString();
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: fetchLimit,
        timeField: filters.timeField,
      });

      if (filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.status) params.append('status', filters.status);
      if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);

      const { startDate, endDate } = getDateParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = (await api.get(`/tasks?${params.toString()}`)) as unknown as {
        success: boolean;
        data: TaskItem[];
        pagination: TaskPagination;
      };

      if (res.success) {
        setTasks(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Không thể lấy danh sách công việc', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters.timeField, filters.search, filters.status, filters.assigneeId, getDateParams, statFilter]);

  useEffect(() => {
    fetchStats();
    fetchTasks();
    fetchActivities();
  }, [fetchStats, fetchTasks, fetchActivities]);

  const handleTaskSaved = () => {
    fetchStats();
    fetchTasks();
    fetchActivities();
  };

  const handleTaskDeleted = () => {
    fetchStats();
    fetchTasks();
    fetchActivities();
  };

  // Xử lý khi bấm vào từng ô thống kê
  const handleSelectStatFilter = (type: StatFilterType) => {
    setStatFilter(type);
    setPagination((p) => ({ ...p, page: 1 }));

    if (type === 'IN_PROGRESS' || type === 'TODO' || type === 'COMPLETED') {
      setFilters((prev) => ({ ...prev, status: type }));
    } else if (type === 'ALL') {
      setFilters((prev) => ({ ...prev, status: '' }));
    } else {
      // OVERDUE hoặc WARNING thì bỏ lọc status cụ thể để quét các task chưa hoàn thành
      setFilters((prev) => ({ ...prev, status: '' }));
    }
  };

  // Lọc hiển thị
  const displayedTasks = useMemo(() => {
    if (statFilter === 'OVERDUE') {
      return tasks.filter((task) => checkDeadlineStatus(task.endTime, task.status) === 'OVERDUE');
    }
    if (statFilter === 'WARNING') {
      return tasks.filter((task) => checkDeadlineStatus(task.endTime, task.status) === 'WARNING');
    }
    return tasks;
  }, [tasks, statFilter]);

  const canEditDetailTask = Boolean(
    detailTask &&
      (user?.isAdmin ||
        detailTask.createdBy === user?.id ||
        detailTask.assignees.some((a) => a.userId === user?.id))
  );

  const getStatFilterLabel = (type: StatFilterType) => {
    switch (type) {
      case 'OVERDUE':
        return 'Quá hạn';
      case 'WARNING':
        return 'Gấp trong 24h';
      case 'IN_PROGRESS':
        return 'Đang làm';
      case 'TODO':
        return 'Chưa làm';
      case 'COMPLETED':
        return 'Đã hoàn thành';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Bảng Điều Khiển
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tổng hợp tiến độ và các công việc cần chú ý của toàn đội ngũ.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
        >
          <Plus size={16} />
          <span>Tạo công việc</span>
        </button>
      </div>

      {/* Truyền đầy đủ selectedFilter và onSelectFilter vào DashboardHeroStats */}
      <DashboardHeroStats
        stats={stats}
        selectedFilter={statFilter}
        onSelectFilter={handleSelectStatFilter}
      />

      <DateFilterBar
        filters={filters}
        onChange={(newFilters) => {
          setFilters(newFilters);
          setStatFilter('ALL');
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        showAssigneeFilter={true}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">
              Danh sách công việc
            </h3>
            {statFilter !== 'ALL' && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <span>Đang lọc: <strong>{getStatFilterLabel(statFilter)}</strong></span>
                <button
                  type="button"
                  onClick={() => handleSelectStatFilter('ALL')}
                  className="hover:text-blue-900 dark:hover:text-white"
                  title="Hủy lọc"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">
            {statFilter === 'OVERDUE' || statFilter === 'WARNING'
              ? `Tìm thấy ${displayedTasks.length} công việc`
              : `Tổng cộng: ${pagination.total} công việc (Click vào dòng để xem chi tiết)`}
          </span>
        </div>

        <TaskTable
          tasks={displayedTasks}
          page={pagination.page}
          limit={pagination.limit}
          total={statFilter === 'OVERDUE' || statFilter === 'WARNING' ? displayedTasks.length : pagination.total}
          totalPages={statFilter === 'OVERDUE' || statFilter === 'WARNING' ? 1 : pagination.totalPages}
          loading={loading}
          onPageChange={(newPage) => setPagination((p) => ({ ...p, page: newPage }))}
          onSelectTask={(task) => setDetailTask(task)}
          onEdit={(task) => {
            setEditingTask(task);
            setIsTaskModalOpen(true);
          }}
          onDelete={(task) => setDeletingTask(task)}
        />
      </div>

      {/* Nhật ký thao tác */}
      <ActivityLogCard
        activities={activities}
        loading={activityLoading}
        onSelectActivity={(act) => setSelectedActivity(act)}
      />

      {/* Modal Đối chiếu Hàng gốc vs Hàng mới */}
      <ActivityDiffModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />

      <TaskDetailModal
        task={detailTask}
        onClose={() => setDetailTask(null)}
        canEdit={canEditDetailTask}
        onEdit={(task) => {
          setEditingTask(task);
          setIsTaskModalOpen(true);
        }}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        taskToEdit={editingTask}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={handleTaskSaved}
      />

      <DeleteConfirmModal
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onSuccess={handleTaskDeleted}
      />
    </div>
  );
};

export default HomePage;