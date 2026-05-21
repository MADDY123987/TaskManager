import { Chip } from '@mui/material';
import type { TaskPriority, TaskStatus } from '../../types/api';
import { priorityColor, priorityLabel, statusColor, statusLabel } from '../../utils/format';

export function StatusChip({ status }: { status: TaskStatus }) {
  return <Chip label={statusLabel(status)} color={statusColor(status)} size="small" />;
}

export function PriorityChip({ priority }: { priority: TaskPriority }) {
  return <Chip label={priorityLabel(priority)} color={priorityColor(priority)} size="small" variant="outlined" />;
}
