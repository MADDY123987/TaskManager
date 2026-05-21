import { Button, Stack, Typography } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 8, textAlign: 'center' }}>
      <InboxOutlinedIcon color="disabled" sx={{ fontSize: 56 }} />
      <Stack spacing={0.5}>
        <Typography variant="h6">{title}</Typography>
        {description && <Typography color="text.secondary">{description}</Typography>}
      </Stack>
      {typeof action === 'string' ? <Button>{action}</Button> : action}
    </Stack>
  );
}
