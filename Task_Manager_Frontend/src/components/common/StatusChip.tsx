import { Chip } from '@mui/material';
import type { TaskPriority, TaskStatus } from '../../types/api';
import { priorityColor, priorityLabel, statusColor, statusLabel } from '../../utils/format';

export function StatusChip({ status }: { status: TaskStatus }) {
  return <Chip size="small" label={statusLabel[status]} color={statusColor(status)} variant={status === 'TODO' ? 'outlined' : 'filled'} />;
}

export function PriorityChip({ priority }: { priority: TaskPriority }) {
  return <Chip size="small" label={priorityLabel[priority]} color={priorityColor(priority)} variant="outlined" />;
}
