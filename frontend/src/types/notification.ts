export interface AppNotification {
  id: string;
  taskId: number;
  title: string;
  type: 'OVERDUE' | 'WARNING';
  timeText: string;
  endTime: string;
  message: string;
}