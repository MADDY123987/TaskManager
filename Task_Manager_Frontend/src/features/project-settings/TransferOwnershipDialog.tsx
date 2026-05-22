import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormTextField } from '../../components/forms/FormTextField';

const schema = z.object({
  newOwnerUserId: z.string().min(1, 'New owner user id is required'),
});

type TransferForm = z.infer<typeof schema>;

export function TransferOwnershipDialog({ open, loading, onClose, onTransfer }: { open: boolean; loading?: boolean; onClose: () => void; onTransfer: (userId: string) => void }) {
  const { control, handleSubmit } = useForm<TransferForm>({ resolver: zodResolver(schema), defaultValues: { newOwnerUserId: '' } });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Transfer ownership</DialogTitle>
      <DialogContent>
        <Stack sx={{ pt: 1 }}>
          <FormTextField<TransferForm> name="newOwnerUserId" control={control} label="New owner user id" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" loading={loading} onClick={handleSubmit(({ newOwnerUserId }) => onTransfer(newOwnerUserId))}>
          Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
