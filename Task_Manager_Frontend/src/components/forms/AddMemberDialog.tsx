import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormTextField } from './FormTextField';

const schema = z.object({
  userId: z.string().min(1, 'User id is required'),
  role: z.string().min(2, 'Role is required'),
});

export type AddMemberForm = z.infer<typeof schema>;

export function AddMemberDialog({ open, loading, onClose, onSubmit }: { open: boolean; loading?: boolean; onClose: () => void; onSubmit: (values: AddMemberForm) => void }) {
  const { control, handleSubmit, reset } = useForm<AddMemberForm>({
    resolver: zodResolver(schema),
    defaultValues: { userId: '', role: 'MEMBER' },
  });

  const submit = handleSubmit((values) => {
    onSubmit(values);
    reset({ userId: '', role: 'MEMBER' });
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Add member</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <FormTextField<AddMemberForm> name="userId" control={control} label="User Id" />
          <FormTextField<AddMemberForm> name="role" control={control} label="Role" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" loading={loading} onClick={submit}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
