import { query } from '../config/db.js';

export const getUserNotifications = async (userId) => {
  const sql = `
    SELECT 
      t.id AS task_id,
      t.title,
      t.end_time,
      t.status,
      TIMESTAMPDIFF(HOUR, NOW(), t.end_time) AS hours_left,
      TIMESTAMPDIFF(MINUTE, NOW(), t.end_time) AS minutes_left
    FROM tasks t
    INNER JOIN task_assignees ta ON ta.task_id = t.id
    WHERE ta.user_id = ?
      AND t.status != 'COMPLETED'
      AND t.end_time <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
    ORDER BY t.end_time ASC
  `;

  const rows = await query(sql, [userId]);

  const notifications = rows.map((row) => {
    const isOverdue = row.minutes_left < 0;
    const absMinutes = Math.abs(row.minutes_left);
    const absHours = Math.floor(absMinutes / 60);
    const remMinutes = absMinutes % 60;

    let timeText = '';
    if (isOverdue) {
      timeText = absHours > 0 
        ? `Đã quá hạn ${absHours} giờ ${remMinutes > 0 ? `${remMinutes} phút` : ''}`
        : `Đã quá hạn ${absMinutes} phút`;
    } else {
      timeText = row.hours_left > 0 
        ? `Còn ${row.hours_left} giờ nữa là đến hạn` 
        : `Còn ${row.minutes_left} phút nữa là đến hạn`;
    }

    return {
      id: `task-${row.task_id}`,
      taskId: row.task_id,
      title: row.title,
      type: isOverdue ? 'OVERDUE' : 'WARNING',
      timeText,
      endTime: row.end_time,
      message: isOverdue
        ? `Công việc "${row.title}" đã quá hạn thực hiện.`
        : `Công việc "${row.title}" sắp đến hạn nộp.`,
    };
  });

  return {
    total: notifications.length,
    notifications,
  };
};