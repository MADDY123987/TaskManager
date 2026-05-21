import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Project } from '../../types/api';

const schema = z.object({
  name: z.string().min(2, 'Project name is required'),
  description: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof schema>;

interface ProjectFormDialogProps {
  open: boolean;
  project?: Project | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => Promise<void> | void;
}

export function ProjectFormDialog({ open, project, loading, onClose, onSubmit }: ProjectFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(schema),
    values: {
      name: project?.name ?? '',
      description: project?.description ?? '',
    },
  });

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>{project ? 'Edit Project' : 'Create Project'}</DialogTitle>
      <DialogContent>
        <Stack component="form" id="project-form" spacing={2.5} sx={{ pt: 1 }} onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField {...field} label="Project name" error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field }) => <TextField {...field} label="Description" minRows={3} multiline />}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" form="project-form" variant="contained" disabled={loading}>
          {project ? 'Save changes' : 'Create project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
