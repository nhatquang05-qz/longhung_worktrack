import { query } from '../config/db.js';

export const getDashboardStats = async (filters = {}, userId = null) => {
  const { search, assigneeId, startDate, endDate, timeField } = filters;
  const safeTimeField = timeField === 'start_time' ? 'start_time' : 'end_time';

  const whereClauses = ['1=1'];
  const params = [];

  // 1. Phân quyền cá nhân (scope=my) hoặc lọc theo thành viên cụ thể
  if (userId) {
    whereClauses.push(`EXISTS (
      SELECT 1 FROM task_assignees ta 
      WHERE ta.task_id = t.id AND ta.user_id = ?
    )`);
    params.push(userId);
  } else if (assigneeId) {
    whereClauses.push(`EXISTS (
      SELECT 1 FROM task_assignees ta 
      WHERE ta.task_id = t.id AND ta.user_id = ?
    )`);
    params.push(assigneeId);
  }

  // 2. Lọc theo mốc thời gian (bắt đầu hoặc kết thúc)
  if (startDate) {
    whereClauses.push(`t.${safeTimeField} >= ?`);
    params.push(startDate);
  }

  if (endDate) {
    whereClauses.push(`t.${safeTimeField} <= ?`);
    params.push(endDate);
  }

  // 3. Lọc theo từ khóa tìm kiếm nếu có
  if (search && search.trim()) {
    whereClauses.push(`(
      t.title LIKE ? 
      OR t.submitter_name LIKE ? 
      OR EXISTS (
        SELECT 1 FROM task_assignees ta_s 
        LEFT JOIN users u_s ON ta_s.user_id = u_s.id 
        WHERE ta_s.task_id = t.id AND (u_s.full_name LIKE ? OR ta_s.other_assignee_name LIKE ?)
      )
    )`);
    const searchParam = `%${search.trim()}%`;
    params.push(searchParam, searchParam, searchParam, searchParam);
  }

  const whereSQL = `WHERE ${whereClauses.join(' AND ')}`;

  const sql = `
    SELECT
      COUNT(*) AS total_tasks,
      SUM(CASE WHEN t.status = 'TODO' THEN 1 ELSE 0 END) AS todo_count,
      SUM(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress_count,
      SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_count,
      SUM(
        CASE 
          WHEN t.status != 'COMPLETED' 
               AND t.end_time >= NOW() 
               AND t.end_time <= DATE_ADD(NOW(), INTERVAL 24 HOUR) 
          THEN 1 ELSE 0 
        END
      ) AS warning_count,
      SUM(
        CASE 
          WHEN t.status != 'COMPLETED' 
               AND t.end_time < NOW() 
          THEN 1 ELSE 0 
        END
      ) AS overdue_count
    FROM tasks t
    ${whereSQL}
  `;

  const rows = await query(sql, params);
  const data = rows[0] || {};

  return {
    totalTasks: Number(data.total_tasks) || 0,
    todoCount: Number(data.todo_count) || 0,
    inProgressCount: Number(data.in_progress_count) || 0,
    completedCount: Number(data.completed_count) || 0,
    warningCount: Number(data.warning_count) || 0,
    overdueCount: Number(data.overdue_count) || 0,
  };
};