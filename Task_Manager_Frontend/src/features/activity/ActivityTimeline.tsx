import { Stack, Typography } from '@mui/material';
import type { Task } from '../../types/api';
import { useGetTaskActivityQuery } from '../../api/activityApi';
import { EmptyState } from '../../components/common/EmptyState';
import { ActivityItem } from './ActivityItem';

export function ActivityTimeline({ task }: { task: Task }) {
  const { data: events = [], isLoading } = useGetTaskActivityQuery(task.id);

  return (
    <Stack spacing={1}>
      <Typography variant="h6">Activity</Typography>
      {isLoading ? (
        <Typography color="text.secondary">Loading activity...</Typography>
      ) : events.length ? (
        <Stack>
        {events.map((event, index) => (
          <ActivityItem key={event.id} event={event} last={index === events.length - 1} />
        ))}
        </Stack>
      ) : (
        <EmptyState title="No activity yet" description="Task changes will appear here." />
      )}
    </Stack>
  );
}
