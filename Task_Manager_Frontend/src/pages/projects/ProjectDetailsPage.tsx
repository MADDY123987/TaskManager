import { useMemo, useState } from 'react';
import { Box, Button, Paper, Skeleton, Tab, Tabs, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useParams } from 'react-router-dom';
import { useAddMemberMutation, useGetProjectQuery, useRemoveMemberMutation, useUpdateProjectMutation } from '../../api/projectApi';
import { useCreateTaskMutation, useDeleteTaskMutation, useGetProjectTasksQuery, useUpdateTaskMutation, useUpdateTaskStatusMutation } from '../../api/taskApi';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { TaskDetailsDrawer } from '../../components/common/TaskDetailsDrawer';
import { AddMemberDialog, type AddMemberForm } from '../../components/forms/AddMemberDialog';
import { ProjectDialog, type ProjectForm } from '../../components/forms/ProjectDialog';
import { TaskDialog, type TaskForm } from '../../components/forms/TaskDialog';
import { TasksTable } from '../../components/tables/TasksTable';
import { useSnackbar } from '../../hooks/useSnackbar';
import type { ProjectMember, Task, TaskStatus } from '../../types/api';
import { formatDate } from '../../utils/format';

export function ProjectDetailsPage() {
  const { projectId = '' } = useParams();
  const { data: project, isLoading } = useGetProjectQuery(projectId);
  const { data: tasks = [] } = useGetProjectTasksQuery(projectId);
  const [tab, setTab] = useState(0);
  const [projectDialog, setProjectDialog] = useState(false);
  const [memberDialog, setMemberDialog] = useState(false);
  const [taskDialog, setTaskDialog] = useState<Task | null | undefined>(undefined);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null);
  const [updateProject, updateProjectState] = useUpdateProjectMutation();
  const [addMember, addMemberState] = useAddMemberMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [createTask, createTaskState] = useCreateTaskMutation();
  const [updateTask, updateTaskState] = useUpdateTaskMutation();
  const [updateStatus] = useUpdateTaskStatusMutation();
  const [deleteTask, deleteTaskState] = useDeleteTaskMutation();
  const { notify } = useSnackbar();
  const members = useMemo(() => project?.members ?? [], [project]);

  const saveProject = async (values: ProjectForm) => {
    try {
      await updateProject({ projectId, data: values }).unwrap();
      setProjectDialog(false);
      notify('Project updated');
    } catch {
      notify('Could not update project', 'error');
    }
  };

  const saveMember = async (values: AddMemberForm) => {
    try {
      await addMember({ projectId, data: values }).unwrap();
      setMemberDialog(false);
      notify('Member added');
    } catch {
      notify('Could not add member', 'error');
    }
  };

  const saveTask = async (values: TaskForm) => {
    const data = { ...values, assignedTo: values.assignedTo || null, dueDate: values.dueDate || null };
    try {
      if (taskDialog) await updateTask({ taskId: taskDialog.id, data }).unwrap();
      else await createTask({ projectId, data }).unwrap();
      setTaskDialog(undefined);
      notify('Task saved');
    } catch {
      notify('Could not save task', 'error');
    }
  };

  const changeStatus = async (task: Task, status: TaskStatus) => {
    try {
      await updateStatus({ taskId: task.id, data: { status } }).unwrap();
      notify('Status updated');
    } catch {
      notify('Could not update status', 'error');
    }
  };

  const confirmDeleteTask = async () => {
    if (!deleteTaskTarget) return;
    try {
      await deleteTask(deleteTaskTarget.id).unwrap();
      setDeleteTaskTarget(null);
      notify('Task deleted');
    } catch {
      notify('Could not delete task', 'error');
    }
  };

  if (isLoading) return <Skeleton variant="rounded" height={420} />;
  if (!project) return <EmptyState title="Project not found" description="The requested project is unavailable." />;

  return (
    <>
      <PageHeader title={project.name} subtitle={project.description || 'No description provided.'} action={<Button startIcon={<EditOutlinedIcon />} variant="outlined" onClick={() => setProjectDialog(true)}>Edit</Button>} />
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab label="Overview" />
          <Tab label="Members" />
          <Tab label="Tasks" />
        </Tabs>
      </Paper>
      {tab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Overview</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>{project.description || 'No description provided.'}</Typography>
          <Box sx={{ display: 'flex', gap: 4, mt: 3, flexWrap: 'wrap' }}>
            <Typography>Members: {project.memberCount ?? members.length}</Typography>
            <Typography>Tasks: {tasks.length}</Typography>
            <Typography>Created: {formatDate(project.createdAt)}</Typography>
          </Box>
        </Paper>
      )}
      {tab === 1 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}><Button startIcon={<AddIcon />} variant="contained" onClick={() => setMemberDialog(true)}>Add Member</Button></Box>
          {members.length ? <MembersTable members={members} onRemove={(member) => removeMember({ projectId, userId: member.userId ?? member.id ?? '' })} /> : <EmptyState title="No members" description="Add people to collaborate on this project." />}
        </>
      )}
      {tab === 2 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}><Button startIcon={<AddIcon />} variant="contained" onClick={() => setTaskDialog(null)}>Create Task</Button></Box>
          <TasksTable tasks={tasks} onView={setViewTask} onEdit={setTaskDialog} onDelete={setDeleteTaskTarget} onStatusChange={changeStatus} />
        </>
      )}
      <ProjectDialog open={projectDialog} project={project} loading={updateProjectState.isLoading} onClose={() => setProjectDialog(false)} onSubmit={saveProject} />
      <AddMemberDialog open={memberDialog} loading={addMemberState.isLoading} onClose={() => setMemberDialog(false)} onSubmit={saveMember} />
      <TaskDialog open={taskDialog !== undefined} task={taskDialog} loading={createTaskState.isLoading || updateTaskState.isLoading} onClose={() => setTaskDialog(undefined)} onSubmit={saveTask} />
      <TaskDetailsDrawer open={Boolean(viewTask)} task={viewTask} onClose={() => setViewTask(null)} />
      <ConfirmDialog open={Boolean(deleteTaskTarget)} title="Delete task?" description="This task will be permanently removed." loading={deleteTaskState.isLoading} onClose={() => setDeleteTaskTarget(null)} onConfirm={confirmDeleteTask} />
    </>
  );
}

function MembersTable({ members, onRemove }: { members: ProjectMember[]; onRemove: (member: ProjectMember) => void }) {
  return (
    <Paper>
      <Table>
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell>Joined Date</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
        <TableBody>{members.map((member) => <TableRow key={member.userId ?? member.id ?? member.email} hover><TableCell>{member.name}</TableCell><TableCell>{member.email}</TableCell><TableCell>{member.role}</TableCell><TableCell>{formatDate(member.joinedDate ?? member.createdAt)}</TableCell><TableCell align="right"><Button color="error" onClick={() => onRemove(member)}>Remove</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </Paper>
  );
}
