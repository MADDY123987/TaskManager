import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormTextField } from './FormTextField';
import type { Project } from '../../types/api';

const schema = z.object({
  name: z.string().min(2, 'Project name is required'),
  description: z.string().optional(),
});

export type ProjectForm = z.infer<typeof schema>;

export function ProjectDialog({
  open,
  project,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  project?: Project | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectForm) => void;
}) {
  const { control, handleSubmit, reset } = useForm<ProjectForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    reset({ name: project?.name ?? '', description: project?.description ?? '' });
  }, [project, reset, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{project ? 'Edit project' : 'Create project'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <FormTextField<ProjectForm> name="name" control={control} label="Name" />
          <FormTextField<ProjectForm> name="description" control={control} label="Description" multiline minRows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" loading={loading} onClick={handleSubmit(onSubmit)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
