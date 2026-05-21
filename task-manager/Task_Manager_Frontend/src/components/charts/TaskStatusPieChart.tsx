import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { TaskStatus } from '../../types/api';
import { statusLabel } from '../../utils/format';

const COLORS: Record<TaskStatus, string> = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#1976d2',
  DONE: '#2e7d32',
};

export function TaskStatusPieChart({ data }: { data?: Record<TaskStatus, number> }) {
  const rows = (Object.keys(COLORS) as TaskStatus[]).map((status) => ({
    name: statusLabel(status),
    value: data?.[status] ?? 0,
    color: COLORS[status],
  }));

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={0.25} sx={{ mb: 1 }}>
          <Typography variant="h6">Task Status</Typography>
          <Typography variant="body2" color="text.secondary">
            Work distribution by current state
          </Typography>
        </Stack>
        <Box height={280}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={rows} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={4}>
                {rows.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
