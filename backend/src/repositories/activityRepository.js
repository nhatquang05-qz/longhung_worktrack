import { query } from '../config/db.js';

export const logActivity = async ({ taskId, taskTitle, userId, userName, action, details, oldData = null, newData = null }) => {
  const sql = `
    INSERT INTO task_activities (task_id, task_title, user_id, user_name, action, details, old_data, new_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await query(sql, [
    taskId || null,
    taskTitle,
    userId || null,
    userName,
    action,
    details || null,
    oldData ? JSON.stringify(oldData) : null,
    newData ? JSON.stringify(newData) : null,
  ]);
};

export const getRecentActivities = async (filters = {}, limit = 20) => {
  const { search, assigneeId, startDate, endDate } = filters;
  const whereClauses = ['1=1'];
  const params = [];

  if (assigneeId) {
    whereClauses.push(`ta.user_id = ?`);
    params.push(assigneeId);
  }

  if (startDate) {
    whereClauses.push(`ta.created_at >= ?`);
    params.push(startDate);
  }

  if (endDate) {
    whereClauses.push(`ta.created_at <= ?`);
    params.push(endDate);
  }

  if (search && search.trim()) {
    whereClauses.push(`(
      ta.task_title LIKE ? 
      OR ta.user_name LIKE ? 
      OR ta.details LIKE ?
    )`);
    const searchParam = `%${search.trim()}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  const whereSQL = `WHERE ${whereClauses.join(' AND ')}`;

  const sql = `
    SELECT 
      ta.id,
      ta.task_id,
      ta.task_title,
      ta.user_id,
      ta.user_name,
      ta.action,
      ta.details,
      ta.old_data,
      ta.new_data,
      ta.created_at
    FROM task_activities ta
    ${whereSQL}
    ORDER BY ta.created_at DESC, ta.id DESC
    LIMIT ?
  `;

  const rows = await query(sql, [...params, limit]);

  return rows.map((r) => ({
    ...r,
    old_data: typeof r.old_data === 'string' ? JSON.parse(r.old_data) : r.old_data,
    new_data: typeof r.new_data === 'string' ? JSON.parse(r.new_data) : r.new_data,
  }));
};