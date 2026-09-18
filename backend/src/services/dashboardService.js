import { query } from '../config/db.js';

export const getDashboardStats = async (userId = null) => {
  let userCondition = '';
  const params = [];

  if (userId) {
    userCondition = `
      AND EXISTS (
        SELECT 1 FROM task_assignees ta 
        WHERE ta.task_id = t.id AND ta.user_id = ?
      )
    `;
    params.push(userId);
  }

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
    WHERE 1=1 ${userCondition}
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