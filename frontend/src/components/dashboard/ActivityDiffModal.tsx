import React from 'react';
import { X, History } from 'lucide-react';
import { TaskActivity } from '../../types/activity';
import { formatDateTime } from '../../utils/dateUtils';

interface ActivityDiffModalProps {
  activity: TaskActivity | null;
  onClose: () => void;
}

export const ActivityDiffModal: React.FC<ActivityDiffModalProps> = ({ activity, onClose }) => {
  if (!activity) return null;

  const oldItem = activity.old_data;
  const newItem = activity.new_data;

  const renderStatus = (st?: string | null) => {
    if (!st) return <span className="text-slate-400 italic">Trống</span>;
    if (st === 'COMPLETED') return <span className="text-emerald-600 font-semibold">Đã hoàn thành</span>;
    if (st === 'IN_PROGRESS') return <span className="text-blue-600 font-semibold">Đang làm</span>;
    return <span className="text-slate-600 dark:text-slate-400 font-semibold">Chưa làm</span>;
  };

  const renderAssignees = (assignees?: any[]) => {
    if (!assignees || assignees.length === 0) return <span className="text-slate-400 italic">Trống</span>;
    return assignees.map((a) => a.fullName).join(', ');
  };

  // Các trường so sánh đối chiếu
  const fields = [
    {
      label: 'Nội dung công việc',
      oldVal: oldItem?.title,
      newVal: newItem?.title,
      render: (v: any) => v || <span className="text-slate-400 italic">Trống</span>,
    },
    {
      label: 'Bộ phận thực hiện',
      oldVal: renderAssignees(oldItem?.assignees),
      newVal: renderAssignees(newItem?.assignees),
      render: (v: any) => v,
    },
    {
      label: 'Tiến độ',
      oldVal: oldItem?.status,
      newVal: newItem?.status,
      render: (v: any) => renderStatus(v),
    },
    {
      label: 'Thời gian bắt đầu',
      oldVal: formatDateTime(oldItem?.startTime),
      newVal: formatDateTime(newItem?.startTime),
      render: (v: any) => v,
    },
    {
      label: 'Hạn chót (Deadline)',
      oldVal: formatDateTime(oldItem?.endTime),
      newVal: formatDateTime(newItem?.endTime),
      render: (v: any) => v,
    },
    {
      label: 'Người nộp bàn giao',
      oldVal: oldItem?.submitterName || 'Chưa nộp',
      newVal: newItem?.submitterName || 'Chưa nộp',
      render: (v: any) => v,
    },
    {
      label: 'Hình thức',
      oldVal: oldItem?.format || 'Trực tiếp',
      newVal: newItem?.format || 'Trực tiếp',
      render: (v: any) => v,
    },
    {
      label: 'Tài liệu đính kèm',
      oldVal: oldItem?.driveUrl || 'Không có',
      newVal: newItem?.driveUrl || 'Không có',
      render: (v: any) => (v && v !== 'Không có' ? <span className="text-blue-500 underline truncate block max-w-xs">{v}</span> : v),
    },
    {
      label: 'Ghi chú',
      oldVal: oldItem?.notes || 'Không có',
      newVal: newItem?.notes || 'Không có',
      render: (v: any) => <span className="whitespace-pre-wrap">{v}</span>,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <History size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Đối Chiếu Thay Đổi Dữ Liệu
              </h3>
              <p className="text-xs text-slate-400">
                Thực hiện bởi <strong className="text-slate-700 dark:text-slate-200">{activity.user_name}</strong> lúc {formatDateTime(activity.created_at)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nội dung chi tiết thay đổi */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <span className="font-bold">Tóm tắt: </span>
            <span>{activity.details || 'Không có mô tả chi tiết'}</span>
          </div>

          {/* Bảng so sánh 2 cột */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-3 w-1/4">Thuộc tính</th>
                  <th className="py-2.5 px-3 w-3/8 text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20">
                    Hàng gốc (Trước khi sửa)
                  </th>
                  <th className="py-2.5 px-3 w-3/8 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                    Hàng mới (Sau khi sửa)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {fields.map((f, idx) => {
                  const isChanged = String(f.oldVal).trim() !== String(f.newVal).trim();
                  return (
                    <tr
                      key={idx}
                      className={isChanged ? 'bg-amber-50/40 dark:bg-amber-950/20' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'}
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {f.label}
                        {isChanged && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                            Đã đổi
                          </span>
                        )}
                      </td>
                      <td className={`py-2.5 px-3 ${isChanged ? 'text-rose-700 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-950/10 font-medium' : 'text-slate-500'}`}>
                        {f.render(f.oldVal)}
                      </td>
                      <td className={`py-2.5 px-3 ${isChanged ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10 font-medium' : 'text-slate-500'}`}>
                        {f.render(f.newVal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};