import { TaskItem } from './task';

export interface TaskActivity {
  id: number;
  task_id: number | null;
  task_title: string;
  user_id: number | null;
  user_name: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  details: string | null;
  old_data: TaskItem | null;
  new_data: TaskItem | null;
  created_at: string;
}