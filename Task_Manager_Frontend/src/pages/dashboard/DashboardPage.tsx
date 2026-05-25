import { alpha, Box, Grid, LinearProgress, Paper, Skeleton, Typography } from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import type { ReactNode } from 'react';
import { useGetDashboardQuery } from '../../api/dashboardApi';
import { PageHeader } from '../../components/common/PageHeader';
import { TaskStatusPieChart } from '../../components/charts/TaskStatusPieChart';
import { PriorityBarChart } from '../../components/charts/PriorityBarChart';
import { RecentTasksTable } from '../../components/tables/RecentTasksTable';
import { ActivityItem } from '../../features/activity/ActivityItem';
import { EmptyState } from '../../components/common/EmptyState';
import { toCount, type CountLike } from '../../utils/count';

function MetricCard({
  label,
  value,
  icon,
  tone,
  helper,
}: {
  label: string;
  value?: CountLike;
  icon: ReactNode;
  tone: string;
  helper: string;
}) {
  const metricValue = toCount(value);

  return (
    <Paper
      sx={{
        p: 2.5,
        minHeight: 146,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderTop: `3px solid ${tone}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography color="text.secondary" variant="body2">
            {label}
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.5, fontSize: 34 }}>
            {metricValue}
          </Typography>
        </Box>
        <Box sx={{ width: 46, height: 46, display: 'grid', placeItems: 'center', borderRadius: 2, bgcolor: alpha(tone, 0.1), color: tone }}>
          {icon}
        </Box>
      </Box>
      <Box>
        <LinearProgress variant="determinate" value={Math.min(metricValue * 8, 100)} sx={{ height: 6, borderRadius: 99, bgcolor: alpha(tone, 0.1), '& .MuiLinearProgress-bar': { bgcolor: tone } }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {helper}
        </Typography>
      </Box>
    </Paper>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboardQuery();

  if (import.meta.env.DEV) {
    console.log('dashboard', data);
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A live view of team delivery, priorities, and recent work." />
      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
      ) : isError ? (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6">Dashboard could not be loaded</Typography>
          <Typography color="text.secondary">Check that the backend URL is configured and reachable.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <MetricCard label="Total Projects" value={data?.totalProjects} icon={<FolderOutlinedIcon />} tone="#2563eb" helper="Active project spaces" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <MetricCard label="Total Tasks" value={data?.totalTasks} icon={<AssignmentTurnedInOutlinedIcon />} tone="#7c3aed" helper="Tracked work items" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <MetricCard label="Todo Tasks" value={data?.todoTasks} icon={<PendingActionsOutlinedIcon />} tone="#64748b" helper="Ready to start" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <MetricCard label="In Progress Tasks" value={data?.inProgressTasks} icon={<SyncOutlinedIcon />} tone="#2563eb" helper="Currently moving" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <MetricCard label="Completed Tasks" value={data?.completedTasks} icon={<TaskAltOutlinedIcon />} tone="#16a34a" helper="Done across teams" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <MetricCard label="Overdue Tasks" value={data?.overdueTasks} icon={<WarningAmberOutlinedIcon />} tone="#dc2626" helper="Need attention" />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ p: 2.5, height: '100%' }}>
              <TaskStatusPieChart data={data?.taskStatusDistribution} />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ p: 2.5, height: '100%' }}>
              <PriorityBarChart data={data?.priorityDistribution} />
            </Paper>
          </Grid>
          <Grid size={12}>
            <RecentTasksTable tasks={data?.recentTasks ?? []} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <RecentTasksTable tasks={data?.overdueTasksList ?? []} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Activity
              </Typography>
              {data?.recentActivity?.length ? (
                data.recentActivity.map((event, index) => <ActivityItem key={event.id} event={event} last={index === data.recentActivity!.length - 1} />)
              ) : (
                <EmptyState title="No activity" description="Recent workspace activity will appear here." />
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </>
  );
}
