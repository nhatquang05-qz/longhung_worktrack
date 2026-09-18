import { z } from 'zod';

const assigneeItemSchema = z.object({
  userId: z.number().int().positive().nullable().optional(),
  otherName: z.string().trim().max(150, 'Tên người thực hiện không vượt quá 150 ký tự').nullable().optional(),
}).refine(
  (data) => Boolean(data.userId) || (typeof data.otherName === 'string' && data.otherName.trim().length > 0),
  { message: 'Mỗi người thực hiện phải là thành viên hệ thống hoặc có tên người ngoài' }
);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Nội dung công việc không được để trống').max(1000, 'Nội dung công việc không vượt quá 1000 ký tự'),
  startTime: z.string().min(1, 'Vui lòng chọn thời gian bắt đầu'),
  endTime: z.string().min(1, 'Vui lòng chọn thời gian kết thúc'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).default('TODO'),
  format: z.string().trim().min(1, 'Hình thức không được để trống').max(50, 'Hình thức không vượt quá 50 ký tự').default('Trực tiếp'),
  driveUrl: z
    .string()
    .trim()
    .url('Đường dẫn đính kèm phải là URL hợp lệ')
    .max(2000, 'URL không vượt quá 2000 ký tự')
    .or(z.literal(''))
    .optional()
    .nullable(),
  notes: z.string().trim().max(5000, 'Ghi chú không vượt quá 5000 ký tự').optional().nullable(),
  submitterName: z.string().trim().max(150, 'Tên người nộp không vượt quá 150 ký tự').optional().nullable(),
  assignees: z.array(assigneeItemSchema).min(1, 'Công việc phải có ít nhất 1 người thực hiện'),
}).refine((data) => new Date(data.endTime) >= new Date(data.startTime), {
  message: 'Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu',
  path: ['endTime'],
});

export const updateTaskSchema = createTaskSchema;

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).optional(),
  assigneeId: z.coerce.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeField: z.enum(['start_time', 'end_time']).default('end_time'),
});