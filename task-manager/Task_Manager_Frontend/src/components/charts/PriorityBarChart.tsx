import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TaskPriority } from '../../types/api';
import { priorityLabel } from '../../utils/format';

export function PriorityBarChart({ data }: { data?: Record<TaskPriority, number> }) {
  const rows = (['LOW', 'MEDIUM', 'HIGH'] as TaskPriority[]).map((priority) => ({
    name: priorityLabel(priority),
    count: data?.[priority] ?? 0,
  }));

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={0.25} sx={{ mb: 1 }}>
          <Typography variant="h6">Priority Distribution</Typography>
          <Typography variant="body2" color="text.secondary">
            Urgency mix across active work
          </Typography>
        </Stack>
        <Box height={280}>
          <ResponsiveContainer>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1976d2" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
