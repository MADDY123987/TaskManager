import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormTextField } from './FormTextField';
import type { ProjectMember, Task, TaskPriority } from '../../types/api';

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional(),
  assignedTo: z.coerce.number().positive('Select an assignee').optional().or(z.literal('')),
});

export type TaskForm = z.infer<typeof schema>;

const assigneeValue = (task?: Task | null) => {
  const assigned = task?.assignedTo;
  if (typeof assigned === 'object' && assigned && 'id' in assigned) return Number(assigned.id);
  if (assigned) return Number(assigned);
  return task?.assignee?.id ? Number(task.assignee.id) : '';
};

export function TaskDialog({
  open,
  task,
  loading,
  onClose,
  onSubmit,
  assignees = [],
}: {
  open: boolean;
  task?: Task | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: TaskForm) => void;
  assignees?: ProjectMember[];
}) {
  const { control, handleSubmit, reset } = useForm<TaskForm>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedTo: '' },
  });

  useEffect(() => {
    reset({
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: (task?.priority ?? 'MEDIUM') as TaskPriority,
      dueDate: task?.dueDate?.slice(0, 10) ?? '',
      assignedTo: assigneeValue(task),
    });
  }, [open, reset, task]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{task ? 'Edit task' : 'Create task'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <FormTextField<TaskForm> name="title" control={control} label="Title" />
          <FormTextField<TaskForm> name="description" control={control} label="Description" multiline minRows={3} />
          <FormTextField<TaskForm> name="priority" control={control} label="Priority" select>
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
          </FormTextField>
          <FormTextField<TaskForm> name="dueDate" control={control} label="Due date" type="date" InputLabelProps={{ shrink: true }} />
          <FormTextField<TaskForm> name="assignedTo" control={control} label="Assignee" select>
            <MenuItem value="">Unassigned</MenuItem>
            {assignees.map((member) => {
              const userId = member.userId ?? member.id;
              if (userId === undefined) return null;
              return (
                <MenuItem key={String(userId)} value={Number(userId)}>
                  {member.name} {member.email ? `(${member.email})` : ''}
                </MenuItem>
              );
            })}
          </FormTextField>
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
