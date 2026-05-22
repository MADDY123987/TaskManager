import { Grid, Paper, Typography } from '@mui/material';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DashboardData, TaskPriority, TaskStatus } from '../../types/api';
import { priorityLabel, statusLabel } from '../../utils/format';

const statusColors: Record<TaskStatus, string> = { TODO: '#94a3b8', IN_PROGRESS: '#2563eb', DONE: '#16a34a' };
const priorityColors: Record<TaskPriority, string> = { LOW: '#16a34a', MEDIUM: '#f59e0b', HIGH: '#dc2626' };

export function AnalyticsWidgets({ data }: { data?: DashboardData }) {
  const statusData = (Object.keys(statusLabel) as TaskStatus[]).map((status) => ({ name: statusLabel[status], value: data?.taskStatusDistribution?.[status] ?? 0, status }));
  const priorityData = (Object.keys(priorityLabel) as TaskPriority[]).map((priority) => ({ name: priorityLabel[priority], value: data?.priorityDistribution?.[priority] ?? 0, priority }));
  const trendData = [
    { name: 'Mon', completed: 4, overdue: 1 },
    { name: 'Tue', completed: 7, overdue: 2 },
    { name: 'Wed', completed: 5, overdue: 1 },
    { name: 'Thu', completed: 9, overdue: 3 },
    { name: 'Fri', completed: data?.completedTasks ?? 6, overdue: data?.overdueTasks ?? 0 },
  ];
  const productivity = [
    { name: 'Alex', tasks: 12 },
    { name: 'Sam', tasks: 9 },
    { name: 'Maya', tasks: 7 },
    { name: 'You', tasks: 11 },
  ];

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <ChartCard title="Task status chart">
          <PieChart>
            <Pie data={statusData} dataKey="value" outerRadius={88}>
              {statusData.map((entry) => <Cell key={entry.status} fill={statusColors[entry.status]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ChartCard title="Priority chart">
          <BarChart data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {priorityData.map((entry) => <Cell key={entry.priority} fill={priorityColors[entry.priority]} />)}
            </Bar>
          </BarChart>
        </ChartCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ChartCard title="Completion trend">
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Area type="monotone" dataKey="completed" stroke="#16a34a" fill="#dcfce7" />
          </AreaChart>
        </ChartCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ChartCard title="Overdue trend">
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Area type="monotone" dataKey="overdue" stroke="#dc2626" fill="#fee2e2" />
          </AreaChart>
        </ChartCard>
      </Grid>
      <Grid size={12}>
        <ChartCard title="Member productivity chart">
          <BarChart data={productivity}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="tasks" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>
      </Grid>
    </Grid>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={280}>
        {children}
      </ResponsiveContainer>
    </Paper>
  );
}
