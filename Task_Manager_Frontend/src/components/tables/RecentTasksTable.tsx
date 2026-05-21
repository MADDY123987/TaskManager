import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import type { Task } from '../../types/api';
import { formatDate } from '../../utils/format';
import { PriorityChip, StatusChip } from '../common/StatusChip';
import { EmptyState } from '../common/EmptyState';

export function RecentTasksTable({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) {
    return <EmptyState title="No recent tasks" description="Tasks created across projects will appear here." />;
  }

  return (
    <TableContainer component={Paper} sx={{ overflow: 'hidden' }}>
      <Typography variant="h6" sx={{ p: 2.25, pb: 1.5 }}>
        Recent Tasks
      </Typography>
      <Table sx={{ minWidth: 760 }}>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Project</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Due Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} hover sx={{ '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.03)' } }}>
              <TableCell sx={{ fontWeight: 600 }}>{task.title}</TableCell>
              <TableCell>{task.projectName ?? task.project?.name ?? 'Unassigned'}</TableCell>
              <TableCell>
                <StatusChip status={task.status} />
              </TableCell>
              <TableCell>
                <PriorityChip priority={task.priority} />
              </TableCell>
              <TableCell>{formatDate(task.dueDate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
