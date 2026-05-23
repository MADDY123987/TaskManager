import { Paper, Skeleton, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useGetProjectActivityQuery } from '../../api/activityApi';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { ActivityItem } from '../../features/activity/ActivityItem';

export function ProjectActivityPage() {
  const { projectId = '' } = useParams();
  const { data: events = [], isLoading } = useGetProjectActivityQuery(projectId);

  return (
    <>
      <PageHeader title="Project Activity" subtitle="A chronological feed of project-level changes." />
      <Paper sx={{ p: 3 }}>
        {isLoading ? (
          <Skeleton variant="rounded" height={360} />
        ) : events.length ? (
          <Stack>
            {events.map((event, index) => (
              <ActivityItem key={event.id} event={event} last={index === events.length - 1} />
            ))}
          </Stack>
        ) : (
          <EmptyState title="No activity" description="Project activity will appear here." />
        )}
        <Typography variant="caption" color="text.secondary">
          Project id: {projectId}
        </Typography>
      </Paper>
    </>
  );
}
