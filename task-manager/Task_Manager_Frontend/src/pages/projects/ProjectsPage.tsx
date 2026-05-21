import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
} from '../../api/projectApi';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { useSnackbar } from '../../components/common/snackbarContext';
import { ProjectFormDialog, ProjectFormValues } from '../../components/forms/ProjectFormDialog';
import type { Project } from '../../types/api';
import { formatDate } from '../../utils/format';

type SortKey = 'newest' | 'oldest' | 'name';

export function ProjectsPage() {
  const { data = [], isLoading, isError } = useGetProjectsQuery();
  const [createProject, { isLoading: creating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: updating }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: deleting }] = useDeleteProjectMutation();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const navigate = useNavigate();
  const { notify } = useSnackbar();

  const projects = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    return data
      .filter((project) => `${project.name} ${project.description ?? ''}`.toLowerCase().includes(normalizedSearch))
      .sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name);
        const aTime = new Date(a.createdAt ?? 0).getTime();
        const bTime = new Date(b.createdAt ?? 0).getTime();
        return sort === 'newest' ? bTime - aTime : aTime - bTime;
      });
  }, [data, search, sort]);

  const submitProject = async (values: ProjectFormValues) => {
    if (editingProject) {
      await updateProject({ projectId: editingProject.id, body: values }).unwrap();
      notify('Project updated');
    } else {
      await createProject(values).unwrap();
      notify('Project created');
    }
    setFormOpen(false);
    setEditingProject(null);
  };

  if (isError) {
    return <EmptyState title="Projects unavailable" description="The backend could not return projects." />;
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Projects"
        subtitle="Create, organize, and review team project spaces."
        action={
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => setFormOpen(true)}>
            Create Project
          </Button>
        }
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}
      >
        <TextField
          placeholder="Search projects"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ flex: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        <TextField select label="Sort" value={sort} onChange={(event) => setSort(event.target.value as SortKey)} sx={{ minWidth: 180 }}>
          <MenuItem value="newest">Newest first</MenuItem>
          <MenuItem value="oldest">Oldest first</MenuItem>
          <MenuItem value="name">Name</MenuItem>
        </TextField>
      </Stack>

      {isLoading ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, md: 6, xl: 4 }}>
              <Skeleton variant="rounded" height={190} />
            </Grid>
          ))}
        </Grid>
      ) : projects.length ? (
        <Grid container spacing={2.5}>
          {projects.map((project) => (
            <Grid key={project.id} size={{ xs: 12, md: 6, xl: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 160ms ease, box-shadow 160ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 18px 48px rgba(15, 23, 42, 0.1)',
                  },
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Typography variant="h6">{project.name}</Typography>
                      <Chip label={`${project.memberCount ?? project.members?.length ?? 0} members`} color="primary" size="small" variant="outlined" />
                    </Stack>
                    <Typography color="text.secondary" sx={{ minHeight: 48 }}>
                      {project.description || 'No description provided.'}
                    </Typography>
                    <Stack direction="row" spacing={1.5}>
                      <Stack>
                        <Typography variant="caption" color="text.secondary">
                          Created
                        </Typography>
                        <Typography fontWeight={700}>{formatDate(project.createdAt)}</Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
                  <Button size="small" variant="contained" startIcon={<OpenInNewIcon />} onClick={() => navigate(`/projects/${project.id}`)}>
                    Open
                  </Button>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => {
                          setEditingProject(project);
                          setFormOpen(true);
                        }}
                      >
                        <EditOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => setDeleteTarget(project)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState title="No projects found" description="Create a project or adjust your search." />
      )}

      <ProjectFormDialog
        open={formOpen}
        project={editingProject}
        loading={creating || updating}
        onClose={() => {
          setFormOpen(false);
          setEditingProject(null);
        }}
        onSubmit={submitProject}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete project?"
        description={`This will permanently delete ${deleteTarget?.name ?? 'this project'}.`}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteProject(deleteTarget.id).unwrap();
          notify('Project deleted');
          setDeleteTarget(null);
        }}
      />
    </Stack>
  );
}
