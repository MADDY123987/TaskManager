import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { Avatar, Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { useGetDashboardQuery } from '../../api/dashboardApi';
import { PriorityBarChart } from '../../components/charts/PriorityBarChart';
import { TaskStatusPieChart } from '../../components/charts/TaskStatusPieChart';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { PriorityChip, StatusChip } from '../../components/common/StatusChip';
import { DataColumn, DataTable } from '../../components/tables/DataTable';
import type { Task } from '../../types/api';
import { formatDate, getTaskProjectName } from '../../utils/format';

const metricCards = [
  { key: 'totalProjects', label: 'Total Projects', helper: 'Active workspaces', icon: <FolderOutlinedIcon />, color: '#1769d3' },
  { key: 'totalTasks', label: 'Total Tasks', helper: 'Tracked items', icon: <PendingActionsOutlinedIcon />, color: '#475569' },
  { key: 'completedTasks', label: 'Completed Tasks', helper: 'Shipped work', icon: <AssignmentTurnedInOutlinedIcon />, color: '#16833a' },
  { key: 'overdueTasks', label: 'Overdue Tasks', helper: 'Need attention', icon: <WarningAmberOutlinedIcon />, color: '#dc2626' },
] as const;

const columns: DataColumn<Task>[] = [
  { key: 'title', label: 'Title', render: (task) => task.title },
  { key: 'project', label: 'Project', render: (task) => getTaskProjectName(task) },
  { key: 'status', label: 'Status', render: (task) => <StatusChip status={task.status} /> },
  { key: 'priority', label: 'Priority', render: (task) => <PriorityChip priority={task.priority} /> },
  { key: 'dueDate', label: 'Due Date', render: (task) => formatDate(task.dueDate) },
];

export function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboardQuery();

  if (isError) {
    return <EmptyState title="Dashboard unavailable" description="The backend could not return dashboard data." />;
  }

  return (
    <Stack spacing={3}>
      <PageHeader title="Dashboard" subtitle="Track project health and task movement across your team." />

      <Grid container spacing={2.5}>
        {metricCards.map((metric) => (
          <Grid key={metric.key} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={{ position: 'relative', overflow: 'hidden' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack spacing={0.5}>
                    <Typography color="text.secondary" fontWeight={700}>
                      {metric.label}
                    </Typography>
                    <Typography variant="h4">{isLoading ? <Skeleton width={60} /> : data?.[metric.key] ?? 0}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {metric.helper}
                    </Typography>
                  </Stack>
                  <Avatar
                    sx={{
                      bgcolor: `${metric.color}14`,
                      color: metric.color,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {metric.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 5 }}>
          {isLoading ? <Skeleton variant="rounded" height={330} /> : <TaskStatusPieChart data={data?.statusDistribution} />}
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          {isLoading ? <Skeleton variant="rounded" height={330} /> : <PriorityBarChart data={data?.priorityDistribution} />}
        </Grid>
      </Grid>

      <Stack spacing={2}>
        <Stack spacing={0.25}>
          <Typography variant="h6">Recent Tasks</Typography>
          <Typography color="text.secondary">Newest task activity across your workspace.</Typography>
        </Stack>
        {!isLoading && !data?.recentTasks?.length ? (
          <EmptyState title="No recent tasks" description="Newly created and updated tasks will appear here." />
        ) : (
          <DataTable columns={columns} rows={data?.recentTasks ?? []} loading={isLoading} getRowKey={(task) => task.id} />
        )}
      </Stack>
    </Stack>
  );
}
