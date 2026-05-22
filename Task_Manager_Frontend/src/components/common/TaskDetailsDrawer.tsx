import { Box, Divider, Drawer, Stack, Typography } from '@mui/material';
import type { Task } from '../../types/api';
import { formatDate } from '../../utils/format';
import { PriorityChip, StatusChip } from './StatusChip';
import { CommentList } from '../../features/comments/CommentList';
import { ActivityTimeline } from '../../features/activity/ActivityTimeline';
import { useAppSelector } from '../../hooks/redux';
import { AttachmentList } from '../../features/attachments/AttachmentList';

function Detail({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography>{value || 'Not set'}</Typography>
    </Box>
  );
}

export function TaskDetailsDrawer({ task, open, onClose }: { task: Task | null; open: boolean; onClose: () => void }) {
  const currentUser = useAppSelector((state) => state.auth.user);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 560 }, p: 3 } }}>
      {task && (
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5">{task.title}</Typography>
            <Typography color="text.secondary">{task.projectName ?? task.project?.name}</Typography>
          </Box>
          <Divider />
          <Detail label="Description" value={task.description} />
          <Detail label="Assignee" value={task.assignee?.name ?? (typeof task.assignedTo === 'object' ? task.assignedTo?.name : task.assignedTo)} />
          <Detail label="Creator" value={task.creator?.name ?? task.createdBy?.name} />
          <Detail label="Status" value={<StatusChip status={task.status} />} />
          <Detail label="Priority" value={<PriorityChip priority={task.priority} />} />
          <Detail label="Due date" value={formatDate(task.dueDate)} />
          <Detail label="Created" value={formatDate(task.createdAt)} />
          <Detail label="Updated" value={formatDate(task.updatedAt)} />
          <Divider />
          <AttachmentList />
          <Divider />
          <CommentList taskId={task.id} currentUser={currentUser} />
          <Divider />
          <ActivityTimeline task={task} />
        </Stack>
      )}
    </Drawer>
  );
}
