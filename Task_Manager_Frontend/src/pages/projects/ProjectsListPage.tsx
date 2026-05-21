import { useMemo, useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, Chip, Grid, IconButton, InputAdornment, MenuItem, Skeleton, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { useCreateProjectMutation, useDeleteProjectMutation, useGetProjectsQuery, useUpdateProjectMutation } from '../../api/projectApi';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { ProjectDialog, type ProjectForm } from '../../components/forms/ProjectDialog';
import { useSnackbar } from '../../hooks/useSnackbar';
import type { Project } from '../../types/api';
import { formatDate } from '../../utils/format';

export function ProjectsListPage() {
  const { data = [], isLoading } = useGetProjectsQuery();
  const [createProject, createState] = useCreateProjectMutation();
  const [updateProject, updateState] = useUpdateProjectMutation();
  const [deleteProject, deleteState] = useDeleteProjectMutation();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('created-desc');
  const [dialogProject, setDialogProject] = useState<Project | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const navigate = useNavigate();
  const { notify } = useSnackbar();

  const projects = useMemo(() => {
    const filtered = data.filter((project) => `${project.name} ${project.description ?? ''}`.toLowerCase().includes(query.toLowerCase()));
    return filtered.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    });
  }, [data, query, sort]);

  const saveProject = async (values: ProjectForm) => {
    try {
      if (dialogProject) await updateProject({ projectId: dialogProject.id, data: values }).unwrap();
      else await createProject(values).unwrap();
      setDialogProject(undefined);
      notify('Project saved');
    } catch {
      notify('Could not save project', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProject(deleteTarget.id).unwrap();
      setDeleteTarget(null);
      notify('Project deleted');
    } catch {
      notify('Could not delete project', 'error');
    }
  };

  return (
    <>
      <PageHeader title="Projects" subtitle="Create, sort, and manage team workspaces." action={<Button startIcon={<AddIcon />} variant="contained" onClick={() => setDialogProject(null)}>Create Project</Button>} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField placeholder="Search projects" value={query} onChange={(event) => setQuery(event.target.value)} fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
        <TextField select value={sort} onChange={(event) => setSort(event.target.value)} sx={{ width: { xs: '100%', sm: 220 } }} label="Sort">
          <MenuItem value="created-desc">Newest first</MenuItem>
          <MenuItem value="name">Name</MenuItem>
        </TextField>
      </Stack>
      {isLoading ? (
        <Grid container spacing={2}>{Array.from({ length: 6 }).map((_, i) => <Grid key={i} size={{ xs: 12, md: 6, xl: 4 }}><Skeleton variant="rounded" height={190} /></Grid>)}</Grid>
      ) : projects.length ? (
        <Grid container spacing={2}>
          {projects.map((project) => (
            <Grid key={project.id} size={{ xs: 12, md: 6, xl: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: 'primary.light',
                    boxShadow: '0 16px 34px rgba(15, 23, 42, 0.08)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="h6" sx={{ lineHeight: 1.25 }}>
                      {project.name}
                    </Typography>
                    <Chip size="small" label={`${project.memberCount ?? project.members?.length ?? 0} members`} />
                  </Box>
                  <Typography color="text.secondary" sx={{ mt: 1.25, minHeight: 52 }}>
                    {project.description || 'No description provided.'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Created {formatDate(project.createdAt)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                  <Button startIcon={<OpenInNewOutlinedIcon />} onClick={() => navigate(`/projects/${project.id}`)}>Open</Button>
                  <IconButton onClick={() => setDialogProject(project)} aria-label="Edit project"><EditOutlinedIcon /></IconButton>
                  <IconButton onClick={() => setDeleteTarget(project)} aria-label="Delete project"><DeleteOutlineOutlinedIcon /></IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState title="No projects found" description="Create a project to organize team members and tasks." />
      )}
      <ProjectDialog open={dialogProject !== undefined} project={dialogProject} loading={createState.isLoading || updateState.isLoading} onClose={() => setDialogProject(undefined)} onSubmit={saveProject} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Delete project?" description="This action cannot be undone." loading={deleteState.isLoading} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </>
  );
}
