import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useAddProjectMemberMutation,
  useGetProjectQuery,
  useRemoveProjectMemberMutation,
  useUpdateProjectMutation,
} from '../../api/projectApi';
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetProjectTasksQuery,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
} from '../../api/taskApi';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { PriorityChip, StatusChip } from '../../components/common/StatusChip';
import { useSnackbar } from '../../components/common/snackbarContext';
import { AddMemberDialog, AddMemberValues } from '../../components/forms/AddMemberDialog';
import { ProjectFormDialog, ProjectFormValues } from '../../components/forms/ProjectFormDialog';
import { TaskFormDialog, TaskFormValues } from '../../components/forms/TaskFormDialog';
import { DataColumn, DataTable } from '../../components/tables/DataTable';
import { TaskDetailsDrawer } from '../../components/tasks/TaskDetailsDrawer';
import type { ProjectMember, Task, TaskStatus } from '../../types/api';
import { formatDate } from '../../utils/format';

export function ProjectDetailsPage() {
  const { projectId = '' } = useParams();
  const { data: project, isLoading: projectLoading, isError } = useGetProjectQuery(projectId);
  const { data: tasks = [], isLoading: tasksLoading } = useGetProjectTasksQuery(projectId);
  const [tab, setTab] = useState(0);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null);
  const [removeMemberTarget, setRemoveMemberTarget] = useState<ProjectMember | null>(null);
  const [updateProject, { isLoading: updatingProject }] = useUpdateProjectMutation();
  const [addMember, { isLoading: addingMember }] = useAddProjectMemberMutation();
  const [removeMember, { isLoading: removingMember }] = useRemoveProjectMemberMutation();
  const [createTask, { isLoading: creatingTask }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updatingTask }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: deletingTask }] = useDeleteTaskMutation();
  const [updateStatus] = useUpdateTaskStatusMutation();
  const { notify } = useSnackbar();

  const memberColumns: DataColumn<ProjectMember>[] = useMemo(
    () => [
      { key: 'name', label: 'Name', render: (member) => member.name },
      { key: 'email', label: 'Email', render: (member) => member.email },
      { key: 'role', label: 'Role', render: (member) => member.role },
      { key: 'joined', label: 'Joined Date', render: (member) => formatDate(member.joinedDate ?? member.createdAt) },
      {
        key: 'actions',
        label: 'Actions',
        render: (member) => (
          <IconButton color="error" onClick={() => setRemoveMemberTarget(member)}>
            <DeleteOutlineIcon />
          </IconButton>
        ),
      },
    ],
    [],
  );

  const taskColumns: DataColumn<Task>[] = useMemo(
    () => [
      { key: 'title', label: 'Title', render: (task) => task.title },
      { key: 'assignee', label: 'Assignee', render: (task) => task.assignee?.name ?? task.assignedTo ?? 'Unassigned' },
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
            <Tooltip title="Edit">
              <IconButton
                onClick={() => {
                  setEditingTask(task);
                  setTaskFormOpen(true);
                }}
              >
                <EditOutlinedIcon />
              </IconButton>
            </Tooltip>
            <TextField
              select
              size="small"
              value={task.status}
              onChange={async (event) => {
                await updateStatus({ taskId: task.id, status: event.target.value as TaskStatus, projectId }).unwrap();
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
            <Tooltip title="Delete">
              <IconButton color="error" onClick={() => setDeleteTaskTarget(task)}>
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [notify, projectId, updateStatus],
  );

  const submitProject = async (values: ProjectFormValues) => {
    await updateProject({ projectId, body: values }).unwrap();
    notify('Project updated');
    setProjectFormOpen(false);
  };

  const submitMember = async (values: AddMemberValues) => {
    await addMember({ projectId, body: values }).unwrap();
    notify('Member added');
    setMemberFormOpen(false);
  };

  const submitTask = async (values: TaskFormValues) => {
    const body = { ...values, assignedTo: values.assignedTo || null, dueDate: values.dueDate || null };
    if (editingTask) {
      await updateTask({ taskId: editingTask.id, body, projectId }).unwrap();
      notify('Task updated');
    } else {
      await createTask({ projectId, body }).unwrap();
      notify('Task created');
    }
    setEditingTask(null);
    setTaskFormOpen(false);
  };

  if (isError) return <EmptyState title="Project unavailable" description="The requested project could not be loaded." />;

  return (
    <Stack spacing={3}>
      {projectLoading ? (
        <Skeleton variant="rounded" height={140} />
      ) : (
        <PageHeader
          title={project?.name ?? 'Project'}
          subtitle={project?.description || 'No description provided.'}
          action={
            <Button startIcon={<EditOutlinedIcon />} variant="outlined" onClick={() => setProjectFormOpen(true)}>
              Edit
            </Button>
          }
        />
      )}

      <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 1 }}>
        <Tabs value={tab} onChange={(_, next) => setTab(next)}>
          <Tab label="Overview" />
          <Tab label="Members" />
          <Tab label="Tasks" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Grid container spacing={2.5}>
          {[
            { label: 'Members', value: project?.memberCount ?? project?.members?.length ?? 0 },
            { label: 'Tasks', value: tasks.length },
            { label: 'Created', value: formatDate(project?.createdAt) },
          ].map((item) => (
            <Grid key={item.label} size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Stack spacing={0.5}>
                    <Typography color="text.secondary" fontWeight={700}>
                      {item.label}
                    </Typography>
                    <Typography variant="h5">{item.value}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6">Members</Typography>
              <Chip label={project?.members?.length ?? 0} size="small" color="primary" variant="outlined" />
            </Stack>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setMemberFormOpen(true)}>
              Add Member
            </Button>
          </Stack>
          {project?.members?.length ? (
            <DataTable columns={memberColumns} rows={project.members} getRowKey={(member) => member.userId ?? member.id ?? member.email} />
          ) : (
            <EmptyState title="No members yet" description="Add members to collaborate on this project." />
          )}
        </Stack>
      )}

      {tab === 2 && (
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6">Tasks</Typography>
              <Chip label={tasks.length} size="small" color="primary" variant="outlined" />
            </Stack>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setTaskFormOpen(true)}>
              Create Task
            </Button>
          </Stack>
          {tasks.length || tasksLoading ? (
            <DataTable columns={taskColumns} rows={tasks} loading={tasksLoading} getRowKey={(task) => task.id} />
          ) : (
            <EmptyState title="No tasks yet" description="Create a task to start tracking project work." />
          )}
        </Stack>
      )}

      <ProjectFormDialog
        open={projectFormOpen}
        project={project}
        loading={updatingProject}
        onClose={() => setProjectFormOpen(false)}
        onSubmit={submitProject}
      />
      <AddMemberDialog open={memberFormOpen} loading={addingMember} onClose={() => setMemberFormOpen(false)} onSubmit={submitMember} />
      <TaskFormDialog
        open={taskFormOpen}
        task={editingTask}
        loading={creatingTask || updatingTask}
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={submitTask}
      />
      <TaskDetailsDrawer task={selectedTask} open={!!selectedTask} onClose={() => setSelectedTask(null)} />
      <ConfirmDialog
        open={!!deleteTaskTarget}
        title="Delete task?"
        description={`This will permanently delete ${deleteTaskTarget?.title ?? 'this task'}.`}
        loading={deletingTask}
        onClose={() => setDeleteTaskTarget(null)}
        onConfirm={async () => {
          if (!deleteTaskTarget) return;
          await deleteTask({ taskId: deleteTaskTarget.id, projectId }).unwrap();
          notify('Task deleted');
          setDeleteTaskTarget(null);
        }}
      />
      <ConfirmDialog
        open={!!removeMemberTarget}
        title="Remove member?"
        description={`This will remove ${removeMemberTarget?.name ?? 'this member'} from the project.`}
        confirmLabel="Remove"
        loading={removingMember}
        onClose={() => setRemoveMemberTarget(null)}
        onConfirm={async () => {
          const userId = removeMemberTarget?.userId ?? removeMemberTarget?.id;
          if (!userId) return;
          await removeMember({ projectId, userId }).unwrap();
          notify('Member removed');
          setRemoveMemberTarget(null);
        }}
      />
    </Stack>
  );
}
