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

const schema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.string().min(1, 'Role is required'),
});

export type AddMemberValues = z.infer<typeof schema>;

interface AddMemberDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: AddMemberValues) => Promise<void> | void;
}

export function AddMemberDialog({ open, loading, onClose, onSubmit }: AddMemberDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberValues>({
    resolver: zodResolver(schema),
    defaultValues: { userId: '', role: 'MEMBER' },
  });

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
      <DialogTitle>Add Member</DialogTitle>
      <DialogContent>
        <Stack component="form" id="member-form" spacing={2.5} sx={{ pt: 1 }} onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="userId"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="User ID" error={!!errors.userId} helperText={errors.userId?.message} />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Role" error={!!errors.role} helperText={errors.role?.message}>
                {['MEMBER', 'ADMIN', 'OWNER'].map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" form="member-form" variant="contained" disabled={loading}>
          Add member
        </Button>
      </DialogActions>
    </Dialog>
  );
}
