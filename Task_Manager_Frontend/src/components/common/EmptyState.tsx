import { Box, Button, Paper, Typography } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import type { ReactNode } from 'react';

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <Paper sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}>
      <Box sx={{ color: 'text.secondary', mb: 1 }}>
        <InboxOutlinedIcon fontSize="large" />
      </Box>
      <Typography variant="h6">{title}</Typography>
      {description && (
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: action ? 2 : 0 }}>
          {description}
        </Typography>
      )}
      {typeof action === 'string' ? <Button variant="contained">{action}</Button> : action}
    </Paper>
  );
}
