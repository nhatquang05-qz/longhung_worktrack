export const formatDateTime = (isoString?: string | null): string => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const toInputDateTime = (isoString?: string | null): string => {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const checkDeadlineStatus = (
  endTimeStr: string,
  status: string
): 'COMPLETED' | 'OVERDUE' | 'WARNING' | 'NORMAL' => {
  if (status === 'COMPLETED') return 'COMPLETED';

  const now = new Date().getTime();
  const deadline = new Date(endTimeStr).getTime();
  const diffHours = (deadline - now) / (1000 * 60 * 60);

  if (diffHours < 0) return 'OVERDUE';
  if (diffHours <= 24) return 'WARNING';
  return 'NORMAL';
};