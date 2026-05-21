import { Box, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TaskPriority } from '../../types/api';
import { priorityLabel } from '../../utils/format';

export function PriorityBarChart({ data }: { data?: Record<TaskPriority, number> }) {
  const chartData = (Object.keys(priorityLabel) as TaskPriority[]).map((priority) => ({
    name: priorityLabel[priority],
    count: data?.[priority] ?? 0,
  }));

  return (
    <Box sx={{ height: 280 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Priority Distribution
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
