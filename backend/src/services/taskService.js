import * as taskRepository from '../repositories/taskRepository.js';
import * as userRepository from '../repositories/userRepository.js';
import * as activityRepository from '../repositories/activityRepository.js';

const getLocalDateTimeString = () => {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const formatReadableDateTime = (isoOrSqlStr) => {
  if (!isoOrSqlStr) return '-';
  const d = new Date(isoOrSqlStr);
  if (isNaN(d.getTime())) return String(isoOrSqlStr);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

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
    return;
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

  const completedAt = data.status === 'COMPLETED' ? getLocalDateTimeString() : null;

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

  const statusLabel = (st) => (st === 'COMPLETED' ? 'Đã hoàn thành' : st === 'IN_PROGRESS' ? 'Đang làm' : 'Chưa làm');

  const createdTask = await getTaskDetail(taskId);

  await activityRepository.logActivity({
    taskId,
    taskTitle: data.title,
    userId: currentUser.id,
    userName: currentUser.fullName,
    action: 'CREATE',
    details: `Tạo mới nhiệm vụ (Hạn: ${formatReadableDateTime(data.endTime)} | Trạng thái: ${statusLabel(data.status)})`,
    oldData: null,
    newData: createdTask,
  });

  return createdTask;
};

export const updateTask = async (taskId, data, currentUser) => {
  const existingTask = await taskRepository.findById(taskId);
  if (!existingTask) {
    const error = new Error('Không tìm thấy công việc yêu cầu');
    error.statusCode = 404;
    throw error;
  }

  const isAssigned = await taskRepository.isUserAssignedToTask(taskId, currentUser.id);
  const isCreator = existingTask.created_by === currentUser.id;

  // Cho phép chỉnh sửa nếu là Admin, hoặc người được giao việc, hoặc chính người tạo công việc
  if (!currentUser.isAdmin && !isAssigned && !isCreator) {
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

  // Snapshot cũ trước khi sửa
  const oldTaskSnapshot = await getTaskDetail(taskId);
  const oldAssigneeNames = oldTaskSnapshot.assignees.map((a) => a.fullName).sort().join(', ');

  const newAssigneeNamesList = [];
  for (const a of normalizedAssignees) {
    if (a.userId) {
      const u = await userRepository.findById(a.userId);
      if (u) newAssigneeNamesList.push(u.full_name);
    } else if (a.otherName) {
      newAssigneeNamesList.push(a.otherName);
    }
  }
  const newAssigneeNames = newAssigneeNamesList.sort().join(', ');

  const changes = [];
  const statusLabel = (st) => (st === 'COMPLETED' ? 'Đã hoàn thành' : st === 'IN_PROGRESS' ? 'Đang làm' : 'Chưa làm');

  if (existingTask.title !== data.title.trim()) {
    changes.push(`Nội dung: "${existingTask.title}" ➔ "${data.title.trim()}"`);
  }

  if (existingTask.status !== data.status) {
    changes.push(`Trạng thái: ${statusLabel(existingTask.status)} ➔ ${statusLabel(data.status)}`);
  }

  const oldStart = new Date(existingTask.start_time).getTime();
  const newStart = new Date(data.startTime).getTime();
  if (Math.abs(oldStart - newStart) >= 60000) {
    changes.push(`Bắt đầu: ${formatReadableDateTime(existingTask.start_time)} ➔ ${formatReadableDateTime(data.startTime)}`);
  }

  const oldEnd = new Date(existingTask.end_time).getTime();
  const newEnd = new Date(data.endTime).getTime();
  if (Math.abs(oldEnd - newEnd) >= 60000) {
    changes.push(`Hạn chót: ${formatReadableDateTime(existingTask.end_time)} ➔ ${formatReadableDateTime(data.endTime)}`);
  }

  if ((existingTask.submitter_name || '') !== (cleanSubmitter || '')) {
    changes.push(`Người nộp: "${existingTask.submitter_name || 'Chưa nộp'}" ➔ "${cleanSubmitter || 'Chưa nộp'}"`);
  }

  if (existingTask.format !== data.format) {
    changes.push(`Hình thức: "${existingTask.format}" ➔ "${data.format}"`);
  }

  if ((existingTask.drive_url || '') !== (data.driveUrl || '')) {
    changes.push('Cập nhật liên kết tài liệu đính kèm');
  }

  if ((existingTask.notes || '') !== (data.notes || '')) {
    changes.push('Chỉnh sửa ghi chú');
  }

  if (oldAssigneeNames !== newAssigneeNames) {
    changes.push(`Phân công: [${oldAssigneeNames || 'Trống'}] ➔ [${newAssigneeNames}]`);
  }

  let completedAt = existingTask.completed_at;
  if (data.status === 'COMPLETED') {
    if (existingTask.status !== 'COMPLETED' || !completedAt) {
      completedAt = getLocalDateTimeString();
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

  // Snapshot mới sau khi sửa
  const newTaskSnapshot = await getTaskDetail(taskId);
  const detailText = changes.length > 0 ? changes.join('; ') : 'Cập nhật lại thông tin (không có thay đổi giá trị)';

  await activityRepository.logActivity({
    taskId,
    taskTitle: data.title,
    userId: currentUser.id,
    userName: currentUser.fullName,
    action: 'UPDATE',
    details: detailText,
    oldData: oldTaskSnapshot,
    newData: newTaskSnapshot,
  });

  return newTaskSnapshot;
};

export const deleteTask = async (taskId, currentUser) => {
  const existingTask = await taskRepository.findById(taskId);
  if (!existingTask) {
    const error = new Error('Không tìm thấy công việc yêu cầu');
    error.statusCode = 404;
    throw error;
  }

  const isAssigned = await taskRepository.isUserAssignedToTask(taskId, currentUser.id);
  const isCreator = existingTask.created_by === currentUser.id;

  // Cho phép xóa nếu là Admin, hoặc người được giao việc, hoặc chính người tạo công việc
  if (!currentUser.isAdmin && !isAssigned && !isCreator) {
    const error = new Error('Bạn không có quyền xóa công việc này');
    error.statusCode = 403;
    throw error;
  }

  const oldTaskSnapshot = await getTaskDetail(taskId);

  await taskRepository.deleteTaskById(taskId);

  await activityRepository.logActivity({
    taskId: null,
    taskTitle: existingTask.title,
    userId: currentUser.id,
    userName: currentUser.fullName,
    action: 'DELETE',
    details: `Đã xóa vĩnh viễn công việc (Trạng thái trước khi xóa: ${existingTask.status})`,
    oldData: oldTaskSnapshot,
    newData: null,
  });

  return { message: 'Đã xóa công việc thành công' };
};