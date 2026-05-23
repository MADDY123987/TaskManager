import { Button, Paper, Skeleton, Stack, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteTaskMutation, useGetTaskQuery, useUpdateTaskMutation, useUpdateTaskStatusMutation } from '../../api/taskApi';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { PriorityChip, StatusChip } from '../../components/common/StatusChip';
import { TaskDetailsDrawer } from '../../components/common/TaskDetailsDrawer';
import { TaskDialog, type TaskForm } from '../../components/forms/TaskDialog';
import { useSnackbar } from '../../hooks/useSnackbar';

export function TaskDetailsPage() {
  const { taskId = '' } = useParams();
  const { data: task, isLoading } = useGetTaskQuery(taskId);
  const [updateTask, updateState] = useUpdateTaskMutation();
  const [updateStatus] = useUpdateTaskStatusMutation();
  const [deleteTask, deleteState] = useDeleteTaskMutation();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const navigate = useNavigate();
  const { notify } = useSnackbar();

  if (isLoading) return <Skeleton variant="rounded" height={420} />;
  if (!task) return <EmptyState title="Task not found" description="The requested task could not be loaded." />;

  const saveTask = async (values: TaskForm) => {
    try {
      await updateTask({ taskId: task.id, data: { ...values, assignedTo: values.assignedTo || null, dueDate: values.dueDate || null } }).unwrap();
      setEditOpen(false);
      notify('Task updated');
    } catch {
      notify('Could not update task', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title={task.title}
        subtitle={task.projectName ?? task.project?.name}
        action={
          <Stack direction="row" spacing={1}>
            <Button startIcon={<EditOutlinedIcon />} variant="outlined" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button startIcon={<DeleteOutlineOutlinedIcon />} color="error" variant="outlined" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </Stack>
        }
      />
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography color="text.secondary">{task.description || 'No description provided.'}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <StatusChip status={task.status} />
            <PriorityChip priority={task.priority} />
          </Stack>
          <Button
            variant="contained"
            onClick={() => updateStatus({ taskId: task.id, data: { status: task.status === 'DONE' ? 'TODO' : 'DONE' } })}
            sx={{ alignSelf: 'flex-start' }}
          >
            Toggle done
          </Button>
        </Stack>
      </Paper>
      <TaskDetailsDrawer open task={task} onClose={() => navigate(-1)} />
      <TaskDialog open={editOpen} task={task} loading={updateState.isLoading} onClose={() => setEditOpen(false)} onSubmit={saveTask} />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete task?"
        description="This task will be permanently removed."
        loading={deleteState.isLoading}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteTask(task.id).unwrap().then(() => navigate(-1)).catch(() => notify('Could not delete task', 'error'))}
      />
    </>
  );
}
