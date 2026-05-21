import { Box, Button, Paper, Typography } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import type { ReactNode } from 'react';

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 5 }, textAlign: 'center', borderStyle: 'dashed', bgcolor: 'rgba(255,255,255,0.72)' }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          mx: 'auto',
          mb: 1.5,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          color: 'primary.main',
          bgcolor: 'rgba(37, 99, 235, 0.08)',
        }}
      >
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
