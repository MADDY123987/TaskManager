import { Divider, Drawer, Stack, Typography } from '@mui/material';
import { PriorityChip, StatusChip } from '../common/StatusChip';
import type { Task } from '../../types/api';
import { formatDate, getTaskProjectName } from '../../utils/format';

export function TaskDetailsDrawer({
  task,
  open,
  onClose,
}: {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 440 }, p: 3 } }}>
      {task && (
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <Typography variant="h5">{task.title}</Typography>
            <Typography color="text.secondary">{getTaskProjectName(task)}</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <StatusChip status={task.status} />
            <PriorityChip priority={task.priority} />
          </Stack>
          <Divider />
          <Stack spacing={2}>
            <Info label="Description" value={task.description || 'No description provided.'} />
            <Info label="Assignee" value={task.assignee?.name ?? task.assignedTo ?? 'Unassigned'} />
            <Info label="Creator" value={task.creator?.name ?? 'Unknown'} />
            <Info label="Due date" value={formatDate(task.dueDate)} />
            <Info label="Created" value={formatDate(task.createdAt)} />
            <Info label="Updated" value={formatDate(task.updatedAt)} />
          </Stack>
        </Stack>
      )}
    </Drawer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography>{value}</Typography>
    </Stack>
  );
}
