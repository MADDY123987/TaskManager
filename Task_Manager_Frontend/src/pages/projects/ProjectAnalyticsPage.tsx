import { Box, CircularProgress, Grid, LinearProgress, Paper, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useParams } from 'react-router-dom';
import { useGetProjectAnalyticsQuery } from '../../api/analyticsApi';
import { PageHeader } from '../../components/common/PageHeader';

const colors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'];

export function ProjectAnalyticsPage() {
  const { projectId = '' } = useParams();
  const { data, isLoading } = useGetProjectAnalyticsQuery(projectId);
  const statusData = Object.entries(data?.tasksByStatus ?? {}).map(([name, value]) => ({ name, value }));
  const priorityData = Object.entries(data?.tasksByPriority ?? {}).map(([name, value]) => ({ name, value }));
  const completionRate = data?.completionRate ?? 0;

  return (
    <>
      <PageHeader title="Project Analytics" subtitle="Project delivery metrics and member performance." />
      {isLoading ? (
        <Skeleton variant="rounded" height={640} />
      ) : (
        <Grid container spacing={2}>
          <Metric label="Total Tasks" value={data?.totalTasks} />
          <Metric label="Overdue" value={data?.overdue} />
          <Metric label="Completed This Week" value={data?.completedThisWeek} />
          <Metric label="Completed This Month" value={data?.completedThisMonth} />
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2.5, height: 280, display: 'grid', placeItems: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress variant="determinate" value={completionRate} size={140} thickness={5} />
                <Box sx={{ inset: 0, position: 'absolute', display: 'grid', placeItems: 'center' }}>
                  <Typography variant="h5">{completionRate}%</Typography>
                </Box>
              </Box>
              <Typography fontWeight={700}>Completion Rate</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}><PieWidget title="Tasks by Status" data={statusData} /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><PieWidget title="Tasks by Priority" data={priorityData} /></Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Weekly Trend</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data?.weeklyTrend ?? []}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="completed" stroke="#2563eb" strokeWidth={2} />
                  <Line dataKey="overdue" stroke="#dc2626" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid size={12}>
            <Paper sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Member Stats</Typography>
              <Table>
                <TableHead><TableRow><TableCell>Member</TableCell><TableCell>Tasks</TableCell><TableCell>Completion</TableCell></TableRow></TableHead>
                <TableBody>
                  {(data?.memberStats ?? []).map((member, index) => (
                    <TableRow key={index}>
                      <TableCell>{String(member.name ?? member.memberName ?? 'Member')}</TableCell>
                      <TableCell>{String(member.tasks ?? member.totalTasks ?? 0)}</TableCell>
                      <TableCell><LinearProgress variant="determinate" value={Number(member.completionRate ?? 0)} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value?: number }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Paper sx={{ p: 2.5 }}>
        <Typography color="text.secondary">{label}</Typography>
        <Typography variant="h4">{value ?? 0}</Typography>
      </Paper>
    </Grid>
  );
}

function PieWidget({ title, data }: { title: string; data: Array<{ name: string; value: number }> }) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={82}>
            {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
}
