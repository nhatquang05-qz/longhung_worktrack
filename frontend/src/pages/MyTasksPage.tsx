import React, { useEffect, useState, useCallback } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { TaskItem, TaskPagination } from '../types/task';
import { TaskTable } from '../components/tasks/TaskTable';
import { TaskModal } from '../components/tasks/TaskModal';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { DeleteConfirmModal } from '../components/tasks/DeleteConfirmModal';
import { DateFilterBar, TaskFilterParams } from '../components/dashboard/DateFilterBar';
import { MyTasksDeadlineBanner } from '../components/tasks/MyTasksDeadlineBanner';
import { calculatePresetDates } from '../utils/filterUtils';
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

const MyTasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  // Lưu riêng danh sách đầy đủ các task chưa xong của user để tính banner cảnh báo độc lập với bộ lọc
  const [allMyUrgentTasks, setAllMyUrgentTasks] = useState<TaskItem[]>([]);

  const [pagination, setPagination] = useState<TaskPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<TaskFilterParams>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [detailTask, setDetailTask] = useState<TaskItem | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);

  // 1. Tải danh sách task của user để phục vụ banner cảnh báo
  const fetchUrgentOverview = useCallback(async () => {
    try {
      const res = (await api.get('/tasks/my?limit=100')) as unknown as {
        success: boolean;
        data: TaskItem[];
      };
      if (res.success && res.data) {
        setAllMyUrgentTasks(res.data);
      }
    } catch (err) {
      console.error('Không thể lấy danh sách cảnh báo', err);
    }
  }, []);

  // 2. Tải danh sách task có áp dụng bộ lọc và phân trang
  const fetchMyTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        timeField: filters.timeField,
      });

      if (filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.status) params.append('status', filters.status);

      if (filters.preset === 'CUSTOM') {
        if (filters.customStart) params.append('startDate', `${filters.customStart} 00:00:00`);
        if (filters.customEnd) params.append('endDate', `${filters.customEnd} 23:59:59`);
      } else if (filters.preset !== 'ALL') {
        const { startDate, endDate } = calculatePresetDates(filters.preset);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
      }

      const res = (await api.get(`/tasks/my?${params.toString()}`)) as unknown as {
        success: boolean;
        data: TaskItem[];
        pagination: TaskPagination;
      };

      if (res.success) {
        setTasks(res.data);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchUrgentOverview();
  }, [fetchUrgentOverview]);

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  const handleTaskSaved = () => {
    fetchUrgentOverview();
    fetchMyTasks();
  };

  const handleTaskDeleted = () => {
    fetchUrgentOverview();
    fetchMyTasks();
  };

  const canEditDetailTask = Boolean(
    detailTask &&
      (user?.isAdmin ||
        detailTask.createdBy === user?.id ||
        detailTask.assignees.some((a) => a.userId === user?.id))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Công Việc Của Tôi
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Những nhiệm vụ mà bạn được phân công trực tiếp thực hiện.
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

      {/* Banner Cảnh báo Deadline nổi bật */}
      <MyTasksDeadlineBanner
        tasks={allMyUrgentTasks}
        onSelectTask={(task) => setDetailTask(task)}
      />

      {error && (
        <div className="flex items-center space-x-2 p-3 text-sm rounded-lg bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bộ lọc ngày & trạng thái */}
      <DateFilterBar
        filters={filters}
        onChange={(newFilters) => {
          setFilters(newFilters);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        showAssigneeFilter={false}
      />

      {/* Bảng công việc */}
      <TaskTable
        tasks={tasks}
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        totalPages={pagination.totalPages}
        loading={loading}
        onPageChange={(newPage) => setPagination((p) => ({ ...p, page: newPage }))}
        onSelectTask={(task) => setDetailTask(task)}
        onEdit={(task) => {
          setEditingTask(task);
          setIsTaskModalOpen(true);
        }}
        onDelete={(task) => setDeletingTask(task)}
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

export default MyTasksPage;