import { Box, Typography } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { TaskStatus } from '../../types/api';
import { statusLabel } from '../../utils/format';

const colors: Record<TaskStatus, string> = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#2563eb',
  DONE: '#22c55e',
};

export function TaskStatusPieChart({ data }: { data?: Record<TaskStatus, number> }) {
  const chartData = (Object.keys(statusLabel) as TaskStatus[]).map((status) => ({
    name: statusLabel[status],
    value: data?.[status] ?? 0,
    status,
  }));

  return (
    <Box sx={{ height: 280 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Task Status
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
            {chartData.map((entry) => (
              <Cell key={entry.status} fill={colors[entry.status]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}
