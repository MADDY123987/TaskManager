import { IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import type { Task, TaskStatus } from '../../types/api';
import { formatDate, statusLabel } from '../../utils/format';
import { PriorityChip, StatusChip } from '../common/StatusChip';
import { EmptyState } from '../common/EmptyState';

export function TasksTable({
  tasks,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  tasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}) {
  if (!tasks.length) return <EmptyState title="No tasks yet" description="Create the first task to start tracking work." />;

  return (
    <TableContainer component={Paper} sx={{ overflow: 'hidden' }}>
      <Table sx={{ minWidth: 860 }}>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Assignee</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} hover sx={{ '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.03)' } }}>
              <TableCell sx={{ fontWeight: 600 }}>{task.title}</TableCell>
              <TableCell>{task.assignee?.name ?? (typeof task.assignedTo === 'object' ? task.assignedTo?.name : task.assignedTo) ?? 'Unassigned'}</TableCell>
              <TableCell>
                <PriorityChip priority={task.priority} />
              </TableCell>
              <TableCell>
                <Select size="small" value={task.status} onChange={(event) => onStatusChange(task, event.target.value as TaskStatus)} renderValue={() => <StatusChip status={task.status} />}>
                  {(Object.keys(statusLabel) as TaskStatus[]).map((status) => (
                    <MenuItem key={status} value={status}>
                      {statusLabel[status]}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>{formatDate(task.dueDate)}</TableCell>
              <TableCell align="right">
                <Tooltip title="View">
                  <IconButton onClick={() => onView(task)} aria-label="View task">
                    <VisibilityOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton onClick={() => onEdit(task)} aria-label="Edit task">
                    <EditOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton onClick={() => onDelete(task)} aria-label="Delete task">
                    <DeleteOutlineOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
