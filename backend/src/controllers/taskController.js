import * as taskService from '../services/taskService.js';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../validators/taskValidator.js';

export const handleGetTasks = async (req, res, next) => {
  try {
    const queryFilters = taskQuerySchema.parse(req.query);
    const result = await taskService.getTasks(queryFilters, null);

    res.set('Cache-Control', 'private, max-age=30, must-revalidate');

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: error.errors[0]?.message || 'Tham số truy vấn không hợp lệ',
      });
    }
    next(error);
  }
};

export const handleGetMyTasks = async (req, res, next) => {
  try {
    const queryFilters = taskQuerySchema.parse(req.query);
    const result = await taskService.getTasks(queryFilters, req.user.id);

    res.set('Cache-Control', 'private, max-age=30, must-revalidate');

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: error.errors[0]?.message || 'Tham số truy vấn không hợp lệ',
      });
    }
    next(error);
  }
};

export const handleGetTaskDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await taskService.getTaskDetail(id);

    res.set('Cache-Control', 'private, max-age=30, must-revalidate');

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const handleCreateTask = async (req, res, next) => {
  try {
    const validatedData = createTaskSchema.parse(req.body);
    const newTask = await taskService.createTask(validatedData, req.user);

    return res.status(201).json({
      success: true,
      message: 'Tạo công việc thành công',
      data: newTask,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: error.errors[0]?.message || 'Dữ liệu không hợp lệ',
      });
    }
    next(error);
  }
};

export const handleUpdateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateTaskSchema.parse(req.body);
    const updatedTask = await taskService.updateTask(id, validatedData, req.user);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật công việc thành công',
      data: updatedTask,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: error.errors[0]?.message || 'Dữ liệu không hợp lệ',
      });
    }
    next(error);
  }
};

export const handleDeleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await taskService.deleteTask(id, req.user);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};