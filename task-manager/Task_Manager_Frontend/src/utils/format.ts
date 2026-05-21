import dayjs from 'dayjs';
import type { TaskPriority, TaskStatus } from '../types/api';

export type MuiStatusColor = 'default' | 'primary' | 'success' | 'warning' | 'error';

export const formatDate = (value?: string | null) => (value ? dayjs(value).format('MMM D, YYYY') : 'No date');

export const statusLabel = (status: TaskStatus) =>
  ({ TODO: 'To do', IN_PROGRESS: 'In progress', DONE: 'Done' })[status];

export const priorityLabel = (priority: TaskPriority) =>
  ({ LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' })[priority];

export const statusColor = (status: TaskStatus): MuiStatusColor =>
  ({ TODO: 'default', IN_PROGRESS: 'primary', DONE: 'success' })[status] as MuiStatusColor;

export const priorityColor = (priority: TaskPriority): MuiStatusColor =>
  ({ LOW: 'success', MEDIUM: 'warning', HIGH: 'error' })[priority] as MuiStatusColor;

export const getTaskProjectName = (task: { projectName?: string; project?: { name?: string } }) =>
  task.projectName ?? task.project?.name ?? 'Unassigned';
