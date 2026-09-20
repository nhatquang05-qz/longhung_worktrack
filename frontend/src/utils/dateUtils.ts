/**
 * Chuyển chuỗi ISO / MySQL datetime thành định dạng YYYY-MM-DDTHH:mm để gán vào input datetime-local
 * Sử dụng Local Time thay vì toISOString() (UTC) để tránh lỗi giật giờ về 0:00 do lệch múi giờ trên Vercel.
 */
export const toInputDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';

  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';

  const pad = (n: number) => n.toString().padStart(2, '0');
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();

  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

export const checkDeadlineStatus = (
  endTime: string,
  status: string
): 'NORMAL' | 'WARNING' | 'OVERDUE' => {
  if (status === 'COMPLETED') return 'NORMAL';

  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  if (isNaN(end)) return 'NORMAL';

  const diffMs = end - now;

  // Quá hạn
  if (diffMs < 0) return 'OVERDUE';

  // Sắp đến hạn (còn dưới 24h)
  const twentyFourHours = 24 * 60 * 60 * 1000;
  if (diffMs <= twentyFourHours) return 'WARNING';

  return 'NORMAL';
};