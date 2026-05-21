import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Task } from '../../types/api';

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof schema>;

interface TaskFormDialogProps {
  open: boolean;
  task?: Task | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
}

export function TaskFormDialog({ open, task, loading, onClose, onSubmit }: TaskFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    values: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? 'MEDIUM',
      dueDate: task?.dueDate?.slice(0, 10) ?? '',
      assignedTo: task?.assignedTo ?? task?.assignee?.id ?? '',
    },
  });

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
      <DialogContent>
        <Stack component="form" id="task-form" spacing={2.5} sx={{ pt: 1 }} onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Title" error={!!errors.title} helperText={errors.title?.message} />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => <TextField {...field} label="Description" minRows={3} multiline />}
          />
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Priority">
                {['LOW', 'MEDIUM', 'HIGH'].map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => <TextField {...field} label="Due date" type="date" InputLabelProps={{ shrink: true }} />}
          />
          <Controller
            name="assignedTo"
            control={control}
            render={({ field }) => <TextField {...field} label="Assigned to user ID" />}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" form="task-form" variant="contained" disabled={loading}>
          {task ? 'Save changes' : 'Create task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
