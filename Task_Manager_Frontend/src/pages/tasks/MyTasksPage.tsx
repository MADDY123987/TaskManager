import { useMemo, useState } from 'react';
import { Grid, MenuItem, Paper, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { useGetMyTasksQuery, useUpdateTaskStatusMutation } from '../../api/taskApi';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { TaskDetailsDrawer } from '../../components/common/TaskDetailsDrawer';
import { TasksTable } from '../../components/tables/TasksTable';
import { useAppSelector } from '../../hooks/redux';
import { useSnackbar } from '../../hooks/useSnackbar';
import type { Task, TaskStatus } from '../../types/api';

export function MyTasksPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data = [], isLoading, isError } = useGetMyTasksQuery(user);
  const [updateStatus] = useUpdateTaskStatusMutation();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [sort, setSort] = useState('due');
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const { notify } = useSnackbar();

  const tasks = useMemo(() => {
    return data
      .filter((task) => `${task.title} ${task.description ?? ''}`.toLowerCase().includes(query.toLowerCase()))
      .filter((task) => (status === 'ALL' ? true : task.status === status))
      .sort((a, b) => {
        if (sort === 'priority') return priorityWeight(b.priority) - priorityWeight(a.priority);
        return new Date(a.dueDate ?? '2999-01-01').getTime() - new Date(b.dueDate ?? '2999-01-01').getTime();
      });
  }, [data, query, sort, status]);

  const changeStatus = async (task: Task, nextStatus: TaskStatus) => {
    try {
      await updateStatus({ taskId: task.id, data: { status: nextStatus } }).unwrap();
      notify('Status updated');
    } catch {
      notify('Could not update status', 'error');
    }
  };

  return (
    <>
      <PageHeader title="My Tasks" subtitle="Tasks assigned to your account across all projects." />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField label="Search" value={query} onChange={(event) => setQuery(event.target.value)} fullWidth />
        <TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="ALL">All</MenuItem>
          <MenuItem value="TODO">To do</MenuItem>
          <MenuItem value="IN_PROGRESS">In progress</MenuItem>
          <MenuItem value="DONE">Done</MenuItem>
        </TextField>
        <TextField select label="Sort" value={sort} onChange={(event) => setSort(event.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="due">Due date</MenuItem>
          <MenuItem value="priority">Priority</MenuItem>
        </TextField>
      </Stack>
      {isLoading ? (
        <Grid container spacing={2}>{Array.from({ length: 4 }).map((_, i) => <Grid key={i} size={12}><Skeleton variant="rounded" height={82} /></Grid>)}</Grid>
      ) : isError ? (
        <Paper sx={{ p: 3 }}><Typography>Could not load your tasks.</Typography></Paper>
      ) : tasks.length ? (
        <TasksTable tasks={tasks} onView={setViewTask} onEdit={setViewTask} onDelete={setViewTask} onStatusChange={changeStatus} />
      ) : (
        <EmptyState title="No assigned tasks" description="Tasks assigned to you will appear here." />
      )}
      <TaskDetailsDrawer open={Boolean(viewTask)} task={viewTask} onClose={() => setViewTask(null)} />
    </>
  );
}

function priorityWeight(priority: string) {
  return priority === 'HIGH' ? 3 : priority === 'MEDIUM' ? 2 : 1;
}
