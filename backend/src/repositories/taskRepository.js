import { pool, query } from '../config/db.js';

export const findById = async (id) => {
  const sql = `
    SELECT 
      t.id,
      t.title,
      t.start_time,
      t.end_time,
      t.status,
      t.completed_at,
      t.format,
      t.drive_url,
      t.notes,
      t.submitter_name,
      t.created_by,
      t.created_at,
      t.updated_at,
      u.full_name AS creator_name
    FROM tasks t
    LEFT JOIN users u ON t.created_by = u.id
    WHERE t.id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
};

export const getAssigneesByTaskId = async (taskId) => {
  const sql = `
    SELECT 
      ta.id,
      ta.task_id,
      ta.user_id,
      ta.other_assignee_name,
      u.full_name AS user_full_name,
      u.username AS user_username
    FROM task_assignees ta
    LEFT JOIN users u ON ta.user_id = u.id
    WHERE ta.task_id = ?
    ORDER BY ta.id ASC
  `;
  return await query(sql, [taskId]);
};

export const getAssigneesByTaskIds = async (taskIds) => {
  if (!taskIds || taskIds.length === 0) return [];
  const placeholders = taskIds.map(() => '?').join(',');
  const sql = `
    SELECT 
      ta.id,
      ta.task_id,
      ta.user_id,
      ta.other_assignee_name,
      u.full_name AS user_full_name,
      u.username AS user_username
    FROM task_assignees ta
    LEFT JOIN users u ON ta.user_id = u.id
    WHERE ta.task_id IN (${placeholders})
    ORDER BY ta.id ASC
  `;
  return await query(sql, taskIds);
};

export const isUserAssignedToTask = async (taskId, userId) => {
  const sql = `
    SELECT 1 FROM task_assignees
    WHERE task_id = ? AND user_id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [taskId, userId]);
  return rows.length > 0;
};

export const findTasksWithPagination = async (filters, onlyAssignedUserId = null) => {
  const { page, limit, search, status, assigneeId, startDate, endDate, timeField } = filters;
  const offset = (page - 1) * limit;

  // Bảo vệ SQL Injection: Whitelist strictly tên cột thời gian
  const safeTimeField = timeField === 'start_time' ? 'start_time' : 'end_time';

  const whereClauses = [];
  const params = [];

  if (onlyAssignedUserId) {
    whereClauses.push(`EXISTS (SELECT 1 FROM task_assignees ta_filter WHERE ta_filter.task_id = t.id AND ta_filter.user_id = ?)`);
    params.push(onlyAssignedUserId);
  } else if (assigneeId) {
    whereClauses.push(`EXISTS (SELECT 1 FROM task_assignees ta_filter WHERE ta_filter.task_id = t.id AND ta_filter.user_id = ?)`);
    params.push(assigneeId);
  }

  if (status) {
    whereClauses.push(`t.status = ?`);
    params.push(status);
  }

  if (startDate) {
    whereClauses.push(`t.${safeTimeField} >= ?`);
    params.push(startDate);
  }

  if (endDate) {
    whereClauses.push(`t.${safeTimeField} <= ?`);
    params.push(endDate);
  }

  if (search) {
    whereClauses.push(`(
      t.title LIKE ? 
      OR t.submitter_name LIKE ? 
      OR EXISTS (
        SELECT 1 FROM task_assignees ta_s 
        LEFT JOIN users u_s ON ta_s.user_id = u_s.id 
        WHERE ta_s.task_id = t.id AND (u_s.full_name LIKE ? OR ta_s.other_assignee_name LIKE ?)
      )
    )`);
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam, searchParam);
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) AS total FROM tasks t ${whereSQL}`;
  const countResult = await query(countSql, params);
  const total = countResult[0]?.total || 0;

  const listSql = `
    SELECT 
      t.id,
      t.title,
      t.start_time,
      t.end_time,
      t.status,
      t.completed_at,
      t.format,
      t.drive_url,
      t.notes,
      t.submitter_name,
      t.created_by,
      t.created_at,
      t.updated_at,
      u.full_name AS creator_name
    FROM tasks t
    LEFT JOIN users u ON t.created_by = u.id
    ${whereSQL}
    ORDER BY t.${safeTimeField} ASC, t.id DESC
    LIMIT ? OFFSET ?
  `;
  const rows = await query(listSql, [...params, limit, offset]);

  return {
    rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const createTaskWithAssignees = async (taskData, assignees) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const taskSql = `
      INSERT INTO tasks (
        title, start_time, end_time, status, completed_at, format, drive_url, notes, submitter_name, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [taskResult] = await connection.execute(taskSql, [
      taskData.title,
      taskData.startTime,
      taskData.endTime,
      taskData.status,
      taskData.completedAt,
      taskData.format,
      taskData.driveUrl || null,
      taskData.notes || null,
      taskData.submitterName,
      taskData.createdBy,
    ]);

    const taskId = taskResult.insertId;

    if (assignees && assignees.length > 0) {
      const assigneeSql = `
        INSERT INTO task_assignees (task_id, user_id, other_assignee_name)
        VALUES (?, ?, ?)
      `;
      for (const item of assignees) {
        await connection.execute(assigneeSql, [
          taskId,
          item.userId || null,
          item.userId ? null : item.otherName || null,
        ]);
      }
    }

    await connection.commit();
    return taskId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateTaskWithAssignees = async (taskId, taskData, assignees) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const taskSql = `
      UPDATE tasks SET
        title = ?,
        start_time = ?,
        end_time = ?,
        status = ?,
        completed_at = ?,
        format = ?,
        drive_url = ?,
        notes = ?,
        submitter_name = ?
      WHERE id = ?
    `;
    await connection.execute(taskSql, [
      taskData.title,
      taskData.startTime,
      taskData.endTime,
      taskData.status,
      taskData.completedAt,
      taskData.format,
      taskData.driveUrl || null,
      taskData.notes || null,
      taskData.submitterName,
      taskId,
    ]);

    await connection.execute(`DELETE FROM task_assignees WHERE task_id = ?`, [taskId]);

    const assigneeSql = `
      INSERT INTO task_assignees (task_id, user_id, other_assignee_name)
      VALUES (?, ?, ?)
    `;
    for (const item of assignees) {
      await connection.execute(assigneeSql, [
        taskId,
        item.userId || null,
        item.userId ? null : item.otherName || null,
      ]);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteTaskById = async (taskId) => {
  const sql = `DELETE FROM tasks WHERE id = ?`;
  await query(sql, [taskId]);
};