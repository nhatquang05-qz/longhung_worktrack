export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export interface TaskAssignee {
  id?: number;
  userId?: number | null;
  fullName: string;
  username?: string | null;
  isAccount: boolean;
}

export interface TaskItem {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: TaskStatus;
  completedAt: string | null;
  format: string;
  driveUrl: string | null;
  notes: string | null;
  submitterName: string;
  createdBy: number | null;
  creatorName: string | null;
  createdAt: string;
  updatedAt: string;
  assignees: TaskAssignee[];
}

export interface TaskPayload {
  title: string;
  startTime: string;
  endTime: string;
  status: TaskStatus;
  format: string;
  driveUrl?: string | null;
  notes?: string | null;
  submitterName: string;
  assignees: {
    userId?: number | null;
    otherName?: string | null;
  }[];
}

export interface TaskPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}