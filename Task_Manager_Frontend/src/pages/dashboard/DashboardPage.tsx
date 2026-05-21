import { Grid, Paper, Skeleton, Typography } from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useGetDashboardQuery } from '../../api/dashboardApi';
import { PageHeader } from '../../components/common/PageHeader';
import { TaskStatusPieChart } from '../../components/charts/TaskStatusPieChart';
import { PriorityBarChart } from '../../components/charts/PriorityBarChart';
import { RecentTasksTable } from '../../components/tables/RecentTasksTable';

function MetricCard({ label, value, icon }: { label: string; value?: number; icon: React.ReactNode }) {
  return (
    <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Paper sx={{ width: 48, height: 48, display: 'grid', placeItems: 'center', bgcolor: 'primary.50', color: 'primary.main' }}>{icon}</Paper>
      <div>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        <Typography variant="h5">{value ?? 0}</Typography>
      </div>
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
            <MetricCard label="Total Projects" value={data?.totalProjects} icon={<FolderOutlinedIcon />} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard label="Total Tasks" value={data?.totalTasks} icon={<AssignmentTurnedInOutlinedIcon />} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard label="Completed Tasks" value={data?.completedTasks} icon={<TaskAltOutlinedIcon />} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard label="Overdue Tasks" value={data?.overdueTasks} icon={<WarningAmberOutlinedIcon />} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ p: 2 }}>
              <TaskStatusPieChart data={data?.taskStatusDistribution} />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ p: 2 }}>
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
