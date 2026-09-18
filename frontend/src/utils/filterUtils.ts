export type DatePreset = 'ALL' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM';

export interface DateRangeResult {
  startDate?: string;
  endDate?: string;
}

const formatDateToSql = (d: Date, endOfDay = false): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const time = endOfDay ? '23:59:59' : '00:00:00';
  return `${y}-${m}-${day} ${time}`;
};

export const calculatePresetDates = (preset: DatePreset): DateRangeResult => {
  const now = new Date();

  if (preset === 'THIS_WEEK') {
    const dayOfWeek = now.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      startDate: formatDateToSql(monday, false),
      endDate: formatDateToSql(sunday, true),
    };
  }

  if (preset === 'THIS_MONTH') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      startDate: formatDateToSql(firstDay, false),
      endDate: formatDateToSql(lastDay, true),
    };
  }

  if (preset === 'THIS_YEAR') {
    const firstDay = new Date(now.getFullYear(), 0, 1);
    const lastDay = new Date(now.getFullYear(), 11, 31);

    return {
      startDate: formatDateToSql(firstDay, false),
      endDate: formatDateToSql(lastDay, true),
    };
  }

  return {};
};