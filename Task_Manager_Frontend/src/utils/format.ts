import dayjs from 'dayjs';
import type { TaskPriority, TaskStatus } from '../types/api';

export const formatDate = (value?: string | null) => (value ? dayjs(value).format('MMM D, YYYY') : 'No date');

export const statusLabel: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

export const priorityLabel: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const statusColor = (status: TaskStatus) => {
  if (status === 'DONE') return 'success';
  if (status === 'IN_PROGRESS') return 'primary';
  return 'default';
};

export const priorityColor = (priority: TaskPriority) => {
  if (priority === 'HIGH') return 'error';
  if (priority === 'MEDIUM') return 'warning';
  return 'success';
};
