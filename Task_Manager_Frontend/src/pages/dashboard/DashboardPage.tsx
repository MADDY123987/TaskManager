import { alpha, Box, Grid, LinearProgress, Paper, Skeleton, Typography } from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import type { ReactNode } from 'react';
import { useGetDashboardQuery } from '../../api/dashboardApi';
import { PageHeader } from '../../components/common/PageHeader';
import { TaskStatusPieChart } from '../../components/charts/TaskStatusPieChart';
import { PriorityBarChart } from '../../components/charts/PriorityBarChart';
import { RecentTasksTable } from '../../components/tables/RecentTasksTable';

function MetricCard({
  label,
  value,
  icon,
  tone,
  helper,
}: {
  label: string;
  value?: number;
  icon: ReactNode;
  tone: string;
  helper: string;
}) {
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
            {value ?? 0}
          </Typography>
        </Box>
        <Box sx={{ width: 46, height: 46, display: 'grid', placeItems: 'center', borderRadius: 2, bgcolor: alpha(tone, 0.1), color: tone }}>
          {icon}
        </Box>
      </Box>
      <Box>
        <LinearProgress variant="determinate" value={Math.min((value ?? 0) * 8, 100)} sx={{ height: 6, borderRadius: 99, bgcolor: alpha(tone, 0.1), '& .MuiLinearProgress-bar': { bgcolor: tone } }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {helper}
        </Typography>
      </Box>
    </Paper>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboardQuery();

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
          <Typography color="text.secondary">Check that the backend is running at http://localhost:8080.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard label="Total Projects" value={data?.totalProjects} icon={<FolderOutlinedIcon />} tone="#2563eb" helper="Active project spaces" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard label="Total Tasks" value={data?.totalTasks} icon={<AssignmentTurnedInOutlinedIcon />} tone="#7c3aed" helper="Tracked work items" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard label="Completed Tasks" value={data?.completedTasks} icon={<TaskAltOutlinedIcon />} tone="#16a34a" helper="Done across teams" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
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
        </Grid>
      )}
    </>
  );
}
