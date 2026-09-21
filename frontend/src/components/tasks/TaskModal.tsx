import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, Check } from 'lucide-react';
import api from '../../services/api';
import { TaskItem, TaskPayload, TaskStatus } from '../../types/task';
import { ManagedUser } from '../../types/user';
import { ApiResponse } from '../../types/api';
import { toInputDateTime } from '../../utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';

interface TaskModalProps {
  isOpen: boolean;
  taskToEdit?: TaskItem | null;
  onClose: () => void;
  onSuccess: (savedTask: TaskItem) => void;
}

interface LocalAssignee {
  userId?: number | null;
  name: string;
  isAccount: boolean;
}

const DEFAULT_FORMATS = ['Trực tiếp', 'Online', 'Email', 'Văn bản', 'Văn bản điện tử'];

const formatLocalDateToInput = (d: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  taskToEdit,
  onClose,
  onSuccess,
}) => {
  const { user: currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');

  // State đa chọn cho hình thức
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['Trực tiếp']);
  const [formatDropdownVal, setFormatDropdownVal] = useState('');
  const [customFormatInput, setCustomFormatInput] = useState('');
  const [isCustomFormatMode, setIsCustomFormatMode] = useState(false);

  const [driveUrl, setDriveUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitterName, setSubmitterName] = useState('');

  const [assignees, setAssignees] = useState<LocalAssignee[]>([]);
  const [availableUsers, setAvailableUsers] = useState<ManagedUser[]>([]);

  const [selectedUserVal, setSelectedUserVal] = useState('');
  const [otherNameInput, setOtherNameInput] = useState('');
  const [isOtherMode, setIsOtherMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchUsers = async () => {
      try {
        const res = (await api.get('/users')) as unknown as ApiResponse<ManagedUser[]>;
        if (res.success && res.data) {
          setAvailableUsers(res.data.filter((u) => u.isActive));
        }
      } catch (err) {
        console.error('Không thể lấy danh sách user cho task modal', err);
      }
    };
    fetchUsers();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setStartTime(toInputDateTime(taskToEdit.startTime));
      setEndTime(toInputDateTime(taskToEdit.endTime));
      setStatus(taskToEdit.status);

      // Phân tách chuỗi hình thức đã lưu trong DB thành danh sách mảng
      if (taskToEdit.format) {
        const parsed = taskToEdit.format
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean);
        setSelectedFormats(parsed.length > 0 ? parsed : ['Trực tiếp']);
      } else {
        setSelectedFormats(['Trực tiếp']);
      }

      setDriveUrl(taskToEdit.driveUrl || '');
      setNotes(taskToEdit.notes || '');
      setSubmitterName(taskToEdit.submitterName || '');
      setAssignees(
        taskToEdit.assignees.map((a) => ({
          userId: a.userId || null,
          name: a.fullName,
          isAccount: a.isAccount,
        }))
      );
    } else {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      setTitle('');
      setStartTime(formatLocalDateToInput(now));
      setEndTime(formatLocalDateToInput(nextWeek));
      setStatus('TODO');
      setSelectedFormats(['Trực tiếp']);
      setDriveUrl('');
      setNotes('');
      setSubmitterName('');
      setAssignees([]);
    }
    setError('');
    setSelectedUserVal('');
    setOtherNameInput('');
    setIsOtherMode(false);
    setFormatDropdownVal('');
    setCustomFormatInput('');
    setIsCustomFormatMode(false);
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleAddAssignee = () => {
    if (isOtherMode) {
      const cleanName = otherNameInput.trim();
      if (!cleanName) return;
      if (assignees.some((a) => a.name.toLowerCase() === cleanName.toLowerCase())) {
        setError(`"${cleanName}" đã có trong danh sách phân công`);
        return;
      }
      setAssignees([...assignees, { userId: null, name: cleanName, isAccount: false }]);
      setOtherNameInput('');
      setIsOtherMode(false);
      setError('');
    } else {
      if (!selectedUserVal) return;
      const targetUser = availableUsers.find((u) => u.id === Number(selectedUserVal));
      if (!targetUser) return;
      if (assignees.some((a) => a.userId === targetUser.id)) {
        setError(`"${targetUser.fullName}" đã có trong danh sách phân công`);
        return;
      }
      setAssignees([
        ...assignees,
        { userId: targetUser.id, name: targetUser.fullName, isAccount: true },
      ]);
      setSelectedUserVal('');
      setError('');
    }
  };

  const handleRemoveAssignee = (index: number) => {
    const removedItem = assignees[index];
    const updated = assignees.filter((_, i) => i !== index);
    setAssignees(updated);

    if (submitterName === removedItem.name) {
      setSubmitterName('');
    }
  };

  const handleAddFormat = () => {
    if (isCustomFormatMode) {
      const clean = customFormatInput.trim();
      if (!clean) return;
      if (selectedFormats.some((f) => f.toLowerCase() === clean.toLowerCase())) {
        setError(`Hình thức "${clean}" đã được chọn`);
        return;
      }
      setSelectedFormats([...selectedFormats, clean]);
      setCustomFormatInput('');
      setIsCustomFormatMode(false);
      setError('');
    } else {
      if (!formatDropdownVal) return;
      if (selectedFormats.includes(formatDropdownVal)) {
        setError(`Hình thức "${formatDropdownVal}" đã được chọn`);
        return;
      }
      setSelectedFormats([...selectedFormats, formatDropdownVal]);
      setFormatDropdownVal('');
      setError('');
    }
  };

  const handleRemoveFormat = (index: number) => {
    if (selectedFormats.length <= 1) {
      setError('Vui lòng giữ lại ít nhất 1 hình thức thực hiện');
      return;
    }
    setSelectedFormats(selectedFormats.filter((_, i) => i !== index));
    setError('');
  };

  const formatLocalInputToSql = (val: string): string => {
    if (!val) return '';
    const clean = val.replace('T', ' ');
    return clean.length === 16 ? `${clean}:00` : clean;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (assignees.length === 0) {
      setError('Vui lòng phân công ít nhất 1 người thực hiện');
      return;
    }

    if (selectedFormats.length === 0) {
      setError('Vui lòng chọn ít nhất 1 hình thức thực hiện');
      return;
    }

    if (new Date(endTime) < new Date(startTime)) {
      setError('Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu');
      return;
    }

    setLoading(true);

    const payload: TaskPayload = {
      title: title.trim(),
      startTime: formatLocalInputToSql(startTime),
      endTime: formatLocalInputToSql(endTime),
      status,
      format: selectedFormats.join(', '),
      driveUrl: driveUrl.trim() ? driveUrl.trim() : null,
      notes: notes.trim() ? notes.trim() : null,
      submitterName: submitterName ? submitterName : (null as any),
      assignees: assignees.map((a) => ({
        userId: a.userId || null,
        otherName: a.userId ? null : a.name,
      })),
    };

    try {
      let res: ApiResponse<TaskItem>;
      if (taskToEdit) {
        res = (await api.put(`/tasks/${taskToEdit.id}`, payload)) as unknown as ApiResponse<TaskItem>;
      } else {
        res = (await api.post('/tasks', payload)) as unknown as ApiResponse<TaskItem>;
      }

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Không thể lưu công việc');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
            {taskToEdit ? 'Chỉnh Sửa Công Việc' : 'Tạo Công Việc Mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-center space-x-2 p-3 text-sm rounded-lg bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nội dung công việc <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên/nội dung chi tiết của công việc..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
            />
          </div>

          {/* Phân công người thực hiện */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Bộ phận thực hiện (Assignees) <span className="text-red-500">*</span>
            </label>

            <div className="min-h-[42px] p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-wrap gap-1.5 items-center">
              {assignees.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Chưa có người được phân công</span>
              ) : (
                assignees.map((a, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                      a.isAccount
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                    }`}
                  >
                    <span>{a.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAssignee(idx)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isOtherMode ? (
                <select
                  value={selectedUserVal}
                  onChange={(e) => {
                    if (e.target.value === '__OTHER__') {
                      setIsOtherMode(true);
                      setSelectedUserVal('');
                    } else {
                      setSelectedUserVal(e.target.value);
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                >
                  <option value="">-- Chọn thành viên hệ thống --</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} (@{u.username}) {u.id === currentUser?.id ? '⭐ (Tôi)' : ''}
                    </option>
                  ))}
                  <option value="__OTHER__">➕ Khác (Phòng ban / Người ngoài hệ thống)</option>
                </select>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={otherNameInput}
                    onChange={(e) => setOtherNameInput(e.target.value)}
                    placeholder="Nhập tên người thực hiện / phòng ban..."
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtherMode(false);
                      setOtherNameInput('');
                    }}
                    className="px-2.5 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Quay lại
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddAssignee}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition inline-flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Thêm</span>
              </button>
            </div>
          </div>

          {/* Hình thức thực hiện (Đa chọn tương tự chọn người) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Hình thức thực hiện <span className="text-red-500">*</span>
            </label>

            <div className="min-h-[42px] p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-wrap gap-1.5 items-center">
              {selectedFormats.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Chưa chọn hình thức nào</span>
              ) : (
                selectedFormats.map((fmt, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                  >
                    <span>{fmt}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFormat(idx)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isCustomFormatMode ? (
                <select
                  value={formatDropdownVal}
                  onChange={(e) => {
                    if (e.target.value === '__CUSTOM__') {
                      setIsCustomFormatMode(true);
                      setFormatDropdownVal('');
                    } else {
                      setFormatDropdownVal(e.target.value);
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                >
                  <option value="">-- Chọn hình thức --</option>
                  {DEFAULT_FORMATS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                  <option value="__CUSTOM__">✏️ Khác (Tự nhập...)</option>
                </select>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={customFormatInput}
                    onChange={(e) => setCustomFormatInput(e.target.value)}
                    placeholder="Nhập hình thức cụ thể (ví dụ: Zalo, Họp giao ban, SMS...)..."
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomFormatMode(false);
                      setCustomFormatInput('');
                    }}
                    className="px-2.5 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Quay lại
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddFormat}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition inline-flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Thêm</span>
              </button>
            </div>
          </div>

          {/* Người nộp */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Người nộp
              </label>
              <span className="text-[11px] text-slate-400">Có thể cập nhật khi bàn giao</span>
            </div>
            <select
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
            >
              <option value="">-- Chưa nộp --</option>
              {assignees.map((a, idx) => (
                <option key={idx} value={a.name}>
                  {a.name} {a.isAccount ? '(Tài khoản)' : '(Khác)'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Thời gian kết thúc (Deadline) <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tiến độ
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
            >
              <option value="TODO">Chưa làm</option>
              <option value="IN_PROGRESS">Đang làm</option>
              <option value="COMPLETED">Đã hoàn thành</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Văn bản đính kèm (Google Drive URL)
            </label>
            <input
              type="url"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ghi chú thêm
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập lưu ý hoặc hướng dẫn thêm..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 inline-flex items-center space-x-1.5"
            >
              <Check size={16} />
              <span>{loading ? 'Đang lưu...' : taskToEdit ? 'Cập nhật' : 'Tạo mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};