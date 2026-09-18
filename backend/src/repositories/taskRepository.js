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

export const findTasksWithPagination = async (filters = {}, onlyAssignedUserId = null) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    assigneeId,
    startDate,
    endDate,
    timeField = 'end_time',
  } = filters;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const offset = (pageNum - 1) * limitNum;

  const whereClauses = ['1=1'];
  const params = [];

  const targetTimeColumn = timeField === 'start_time' ? 't.start_time' : 't.end_time';

  if (status) {
    whereClauses.push('t.status = ?');
    params.push(status);
  }

  if (startDate) {
    whereClauses.push(`${targetTimeColumn} >= ?`);
    params.push(startDate);
  }

  if (endDate) {
    whereClauses.push(`${targetTimeColumn} <= ?`);
    params.push(endDate);
  }

  if (search && search.trim()) {
    whereClauses.push(`(
      t.title LIKE ? 
      OR t.submitter_name LIKE ? 
      OR t.notes LIKE ? 
      OR EXISTS (
        SELECT 1 FROM task_assignees sub_ta 
        LEFT JOIN users sub_u ON sub_ta.user_id = sub_u.id
        WHERE sub_ta.task_id = t.id 
          AND (sub_u.full_name LIKE ? OR sub_ta.other_assignee_name LIKE ?)
      )
    )`);
    const s = `%${search.trim()}%`;
    params.push(s, s, s, s, s);
  }

  if (onlyAssignedUserId) {
    whereClauses.push(`EXISTS (
      SELECT 1 FROM task_assignees ta_filter 
      WHERE ta_filter.task_id = t.id AND ta_filter.user_id = ?
    )`);
    params.push(onlyAssignedUserId);
  } else if (assigneeId) {
    whereClauses.push(`EXISTS (
      SELECT 1 FROM task_assignees ta_filter 
      WHERE ta_filter.task_id = t.id AND ta_filter.user_id = ?
    )`);
    params.push(assigneeId);
  }

  const whereSQL = `WHERE ${whereClauses.join(' AND ')}`;

  // Đếm tổng số bản ghi
  const countSql = `
    SELECT COUNT(DISTINCT t.id) as total
    FROM tasks t
    ${whereSQL}
  `;
  const countRows = await query(countSql, params);
  const total = countRows?.[0]?.total || 0;
  const totalPages = Math.ceil(total / limitNum) || 1;

  // Truy vấn lấy dữ liệu với LIMIT và OFFSET dạng số nguyên trực tiếp
  const dataSql = `
    SELECT 
      t.*,
      u.full_name AS creator_name
    FROM tasks t
    LEFT JOIN users u ON t.created_by = u.id
    ${whereSQL}
    ORDER BY t.created_at DESC, t.id DESC
    LIMIT ${limitNum} OFFSET ${offset}
  `;

  const rows = await query(dataSql, params);

  return {
    rows: rows || [],
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
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