import * as taskRepository from '../repositories/taskRepository.js';
import * as userRepository from '../repositories/userRepository.js';

const normalizeAssignees = (assignees) => {
  const seenUsers = new Set();
  const seenOthers = new Set();
  const normalized = [];

  for (const a of assignees) {
    if (a.userId) {
      if (!seenUsers.has(a.userId)) {
        seenUsers.add(a.userId);
        normalized.push({ userId: a.userId, otherName: null });
      }
    } else if (a.otherName && a.otherName.trim()) {
      const cleanName = a.otherName.trim();
      const lower = cleanName.toLowerCase();
      if (!seenOthers.has(lower)) {
        seenOthers.add(lower);
        normalized.push({ userId: null, otherName: cleanName });
      }
    }
  }
  return normalized;
};

const validateSubmitter = async (submitterName, normalizedAssignees) => {
  if (!submitterName || !submitterName.trim()) {
    return; // Người nộp không bắt buộc
  }

  const allowedNames = new Set();
  for (const a of normalizedAssignees) {
    if (a.userId) {
      const u = await userRepository.findById(a.userId);
      if (u) {
        allowedNames.add(u.full_name.trim());
      }
    } else if (a.otherName) {
      allowedNames.add(a.otherName.trim());
    }
  }

  if (!allowedNames.has(submitterName.trim())) {
    const error = new Error('Người nộp phải được chọn từ danh sách người thực hiện của công việc');
    error.statusCode = 400;
    throw error;
  }
};

const attachAssigneesToTasks = async (tasks) => {
  if (!tasks || tasks.length === 0) return [];
  const taskIds = tasks.map((t) => t.id);
  const allAssignees = await taskRepository.getAssigneesByTaskIds(taskIds);

  const assigneesMap = {};
  for (const a of allAssignees) {
    if (!assigneesMap[a.task_id]) {
      assigneesMap[a.task_id] = [];
    }
    assigneesMap[a.task_id].push({
      id: a.id,
      userId: a.user_id,
      fullName: a.user_full_name || a.other_assignee_name,
      username: a.user_username || null,
      isAccount: Boolean(a.user_id),
    });
  }

  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    startTime: t.start_time,
    endTime: t.end_time,
    status: t.status,
    completedAt: t.completed_at,
    format: t.format,
    driveUrl: t.drive_url,
    notes: t.notes,
    submitterName: t.submitter_name,
    createdBy: t.created_by,
    creatorName: t.creator_name,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    assignees: assigneesMap[t.id] || [],
  }));
};

export const getTasks = async (queryFilters, onlyAssignedUserId = null) => {
  const result = await taskRepository.findTasksWithPagination(queryFilters, onlyAssignedUserId);
  const tasksWithAssignees = await attachAssigneesToTasks(result.rows);

  return {
    data: tasksWithAssignees,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  };
};

export const getTaskDetail = async (taskId) => {
  const task = await taskRepository.findById(taskId);
  if (!task) {
    const error = new Error('Không tìm thấy công việc yêu cầu');
    error.statusCode = 404;
    throw error;
  }

  const rawAssignees = await taskRepository.getAssigneesByTaskId(taskId);
  const assignees = rawAssignees.map((a) => ({
    id: a.id,
    userId: a.user_id,
    fullName: a.user_full_name || a.other_assignee_name,
    username: a.user_username || null,
    isAccount: Boolean(a.user_id),
  }));

  return {
    id: task.id,
    title: task.title,
    startTime: task.start_time,
    endTime: task.end_time,
    status: task.status,
    completedAt: task.completed_at,
    format: task.format,
    driveUrl: task.drive_url,
    notes: task.notes,
    submitterName: task.submitter_name,
    createdBy: task.created_by,
    creatorName: task.creator_name,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    assignees,
  };
};

export const createTask = async (data, currentUser) => {
  const normalizedAssignees = normalizeAssignees(data.assignees);
  if (normalizedAssignees.length === 0) {
    const error = new Error('Vui lòng phân công ít nhất một người thực hiện');
    error.statusCode = 400;
    throw error;
  }

  const cleanSubmitter = data.submitterName?.trim() || null;
  await validateSubmitter(cleanSubmitter, normalizedAssignees);

  const completedAt = data.status === 'COMPLETED' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;

  const taskId = await taskRepository.createTaskWithAssignees(
    {
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status,
      completedAt,
      format: data.format || 'Trực tiếp',
      driveUrl: data.driveUrl || null,
      notes: data.notes || null,
      submitterName: cleanSubmitter,
      createdBy: currentUser.id,
    },
    normalizedAssignees
  );

  return await getTaskDetail(taskId);
};

export const updateTask = async (taskId, data, currentUser) => {
  const existingTask = await taskRepository.findById(taskId);
  if (!existingTask) {
    const error = new Error('Không tìm thấy công việc yêu cầu');
    error.statusCode = 404;
    throw error;
  }

  const isAssigned = await taskRepository.isUserAssignedToTask(taskId, currentUser.id);
  if (!currentUser.isAdmin && !isAssigned) {
    const error = new Error('Bạn không có quyền chỉnh sửa công việc này');
    error.statusCode = 403;
    throw error;
  }

  const normalizedAssignees = normalizeAssignees(data.assignees);
  if (normalizedAssignees.length === 0) {
    const error = new Error('Vui lòng phân công ít nhất một người thực hiện');
    error.statusCode = 400;
    throw error;
  }

  const cleanSubmitter = data.submitterName?.trim() || null;
  await validateSubmitter(cleanSubmitter, normalizedAssignees);

  let completedAt = existingTask.completed_at;
  if (data.status === 'COMPLETED') {
    if (existingTask.status !== 'COMPLETED' || !completedAt) {
      completedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
  } else {
    completedAt = null;
  }

  await taskRepository.updateTaskWithAssignees(
    taskId,
    {
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status,
      completedAt,
      format: data.format || 'Trực tiếp',
      driveUrl: data.driveUrl || null,
      notes: data.notes || null,
      submitterName: cleanSubmitter,
    },
    normalizedAssignees
  );

  return await getTaskDetail(taskId);
};

export const deleteTask = async (taskId, currentUser) => {
  const existingTask = await taskRepository.findById(taskId);
  if (!existingTask) {
    const error = new Error('Không tìm thấy công việc yêu cầu');
    error.statusCode = 404;
    throw error;
  }

  const isAssigned = await taskRepository.isUserAssignedToTask(taskId, currentUser.id);
  if (!currentUser.isAdmin && !isAssigned) {
    const error = new Error('Bạn không có quyền xóa công việc này');
    error.statusCode = 403;
    throw error;
  }

  await taskRepository.deleteTaskById(taskId);
  return { message: 'Đã xóa công việc thành công' };
};