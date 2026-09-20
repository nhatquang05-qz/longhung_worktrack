/**
 * Chuyển chuỗi datetime từ DB/API về dạng YYYY-MM-DDTHH:mm cho input type="datetime-local"
 * Parse chuỗi trực tiếp để không bị lệch timezone giữa Local và Vercel.
 */
export const toInputDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';

  // Nếu là dạng ISO: 2026-09-20T12:00:00.000Z hoặc 2026-09-20 12:00:00
  const clean = dateStr.replace(' ', 'T');
  if (clean.includes('T')) {
    const [datePart, timePart] = clean.split('T');
    const timeClean = timePart.slice(0, 5); // Lấy đúng HH:mm
    return `${datePart}T${timeClean}`;
  }

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Hiển thị ngày giờ dạng HH:mm DD/MM/YYYY trên bảng
 */
export const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';

  // Xử lý chuỗi trực tiếp nếu đã có dạng chuẩn YYYY-MM-DD...
  const clean = dateStr.replace('T', ' ');
  const match = clean.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (match) {
    const [, y, m, d, hh, mm] = match;
    return `${hh}:${mm} ${d}/${m}/${y}`;
  }

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export const checkDeadlineStatus = (
  endTime: string,
  status: string
): 'NORMAL' | 'WARNING' | 'OVERDUE' => {
  if (status === 'COMPLETED') return 'NORMAL';

  const endMs = new Date(endTime).getTime();
  if (isNaN(endMs)) return 'NORMAL';

  const nowMs = Date.now();
  const diffMs = endMs - nowMs;

  if (diffMs < 0) return 'OVERDUE';
  if (diffMs <= 24 * 60 * 60 * 1000) return 'WARNING';

  return 'NORMAL';
};