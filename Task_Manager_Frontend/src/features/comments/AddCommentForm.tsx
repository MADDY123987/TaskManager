import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormTextField } from '../../components/forms/FormTextField';

const schema = z.object({ body: z.string().min(1, 'Write a comment first') });
type CommentForm = z.infer<typeof schema>;

export function AddCommentForm({ onAdd }: { onAdd: (body: string) => void }) {
  const { control, handleSubmit, reset } = useForm<CommentForm>({ resolver: zodResolver(schema), defaultValues: { body: '' } });

  const submit = handleSubmit(({ body }) => {
    onAdd(body);
    reset();
  });

  return (
    <Stack spacing={1.25}>
      <FormTextField<CommentForm> name="body" control={control} label="Add comment" multiline minRows={2} />
      <Button variant="contained" onClick={submit} sx={{ alignSelf: 'flex-end' }}>
        Comment
      </Button>
    </Stack>
  );
}
