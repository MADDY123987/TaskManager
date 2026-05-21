import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useGetProjectsQuery } from '../../api/projectApi';
import { useLazyGetProjectTasksQuery, useUpdateTaskStatusMutation } from '../../api/taskApi';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { PriorityChip, StatusChip } from '../../components/common/StatusChip';
import { useSnackbar } from '../../components/common/snackbarContext';
import { DataColumn, DataTable } from '../../components/tables/DataTable';
import { TaskDetailsDrawer } from '../../components/tasks/TaskDetailsDrawer';
import { useAppSelector } from '../../hooks/redux';
import type { Task, TaskStatus } from '../../types/api';
import { formatDate, getTaskProjectName } from '../../utils/format';

type SortKey = 'dueDate' | 'priority' | 'project';
type StatusFilter = 'ALL' | TaskStatus;

export function MyTasksPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: projects = [], isLoading: projectsLoading } = useGetProjectsQuery();
  const [loadProjectTasks] = useLazyGetProjectTasksQuery();
  const [updateStatus] = useUpdateTaskStatusMutation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sort, setSort] = useState<SortKey>('dueDate');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { notify } = useSnackbar();

  useEffect(() => {
    if (!projects.length || !user?.id) return;
    let cancelled = false;
    setLoadingTasks(true);
    Promise.all(projects.map((project) => loadProjectTasks(project.id).unwrap()))
      .then((groups) => {
        if (cancelled) return;
        setTasks(groups.flat().filter((task) => task.assignee?.id === user.id || task.assignedTo === user.id));
      })
      .finally(() => {
        if (!cancelled) setLoadingTasks(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadProjectTasks, projects, user?.id]);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    return tasks
      .filter((task) => `${task.title} ${task.description ?? ''}`.toLowerCase().includes(normalizedSearch))
      .filter((task) => (statusFilter === 'ALL' ? true : task.status === statusFilter))
      .sort((a, b) => {
        if (sort === 'project') return getTaskProjectName(a).localeCompare(getTaskProjectName(b));
        if (sort === 'priority') {
          const weight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return weight[b.priority] - weight[a.priority];
        }
        return new Date(a.dueDate ?? '2999-01-01').getTime() - new Date(b.dueDate ?? '2999-01-01').getTime();
      });
  }, [search, sort, statusFilter, tasks]);

  const columns: DataColumn<Task>[] = [
    { key: 'title', label: 'Title', render: (task) => task.title },
    { key: 'project', label: 'Project', render: (task) => getTaskProjectName(task) },
    { key: 'priority', label: 'Priority', render: (task) => <PriorityChip priority={task.priority} /> },
    { key: 'status', label: 'Status', render: (task) => <StatusChip status={task.status} /> },
    { key: 'dueDate', label: 'Due Date', render: (task) => formatDate(task.dueDate) },
    {
      key: 'actions',
      label: 'Actions',
      render: (task) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View">
            <IconButton onClick={() => setSelectedTask(task)}>
              <VisibilityOutlinedIcon />
            </IconButton>
          </Tooltip>
          <TextField
            select
            size="small"
            value={task.status}
            onChange={async (event) => {
              await updateStatus({ taskId: task.id, status: event.target.value as TaskStatus, projectId: task.projectId }).unwrap();
              setTasks((current) =>
                current.map((item) => (item.id === task.id ? { ...item, status: event.target.value as TaskStatus } : item)),
              );
              notify('Task status updated');
            }}
            sx={{ minWidth: 132 }}
          >
            {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <PageHeader title="My Tasks" subtitle="Tasks assigned to you across projects." />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}
      >
        <TextField
          placeholder="Search tasks"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ flex: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        <TextField select label="Filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} sx={{ minWidth: 160 }}>
          <MenuItem value="ALL">All status</MenuItem>
          <MenuItem value="TODO">To do</MenuItem>
          <MenuItem value="IN_PROGRESS">In progress</MenuItem>
          <MenuItem value="DONE">Done</MenuItem>
        </TextField>
        <TextField select label="Sort" value={sort} onChange={(event) => setSort(event.target.value as SortKey)} sx={{ minWidth: 160 }}>
          <MenuItem value="dueDate">Due date</MenuItem>
          <MenuItem value="priority">Priority</MenuItem>
          <MenuItem value="project">Project</MenuItem>
        </TextField>
      </Stack>

      {filteredTasks.length || loadingTasks || projectsLoading ? (
        <DataTable columns={columns} rows={filteredTasks} loading={loadingTasks || projectsLoading} getRowKey={(task) => task.id} />
      ) : (
        <EmptyState title="No assigned tasks" description="Tasks assigned to your account will appear here." />
      )}

      <TaskDetailsDrawer task={selectedTask} open={!!selectedTask} onClose={() => setSelectedTask(null)} />
    </Stack>
  );
}
