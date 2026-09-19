import { query } from '../config/db.js';

export const getUserNotifications = async (userId) => {
  const sql = `
    SELECT DISTINCT
      t.id AS task_id,
      t.title,
      t.end_time,
      t.status
    FROM tasks t
    INNER JOIN task_assignees ta ON ta.task_id = t.id
    WHERE ta.user_id = ?
      AND t.status != 'COMPLETED'
      AND t.end_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      AND t.end_time <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
    ORDER BY t.end_time ASC
    LIMIT 50
  `;

  const rows = await query(sql, [userId]);

  const nowMs = Date.now();

  const notifications = rows.map((row) => {
    const endTimeMs = new Date(row.end_time).getTime();
    const diffMinutes = Math.floor((endTimeMs - nowMs) / (1000 * 60));
    const isOverdue = diffMinutes < 0;

    const absMinutes = Math.abs(diffMinutes);
    const absHours = Math.floor(absMinutes / 60);
    const remMinutes = absMinutes % 60;

    let timeText = '';
    if (isOverdue) {
      timeText = absHours > 0 
        ? `Đã quá hạn ${absHours} giờ ${remMinutes > 0 ? `${remMinutes} phút` : ''}`
        : `Đã quá hạn ${absMinutes} phút`;
    } else {
      timeText = absHours > 0 
        ? `Còn ${absHours} giờ nữa là đến hạn` 
        : `Còn ${diffMinutes} phút nữa là đến hạn`;
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