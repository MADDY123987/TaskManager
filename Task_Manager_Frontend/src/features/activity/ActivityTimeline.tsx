import { Stack, Typography } from '@mui/material';
import type { Task } from '../../types/api';
import { ActivityItem, type ActivityEvent } from './ActivityItem';

export function ActivityTimeline({ task }: { task: Task }) {
  const events: ActivityEvent[] = [
    { id: 'created', type: 'CREATED', label: 'Task created', createdAt: task.createdAt ?? new Date().toISOString() },
    { id: 'updated', type: 'UPDATED', label: 'Task updated', createdAt: task.updatedAt ?? task.createdAt ?? new Date().toISOString() },
    { id: 'assignee', type: 'ASSIGNEE_CHANGED', label: 'Assignee changed', createdAt: task.updatedAt ?? new Date().toISOString() },
    { id: 'status', type: 'STATUS_CHANGED', label: `Status changed to ${task.status}`, createdAt: task.updatedAt ?? new Date().toISOString() },
    { id: 'comment', type: 'COMMENT_ADDED', label: 'Comment added', createdAt: task.updatedAt ?? new Date().toISOString() },
    ...(task.status === 'DONE' ? [{ id: 'completed', type: 'COMPLETED' as const, label: 'Task completed', createdAt: task.updatedAt ?? new Date().toISOString() }] : []),
  ];

  return (
    <Stack spacing={1}>
      <Typography variant="h6">Activity</Typography>
      <Stack>
        {events.map((event, index) => (
          <ActivityItem key={event.id} event={event} last={index === events.length - 1} />
        ))}
      </Stack>
    </Stack>
  );
}
