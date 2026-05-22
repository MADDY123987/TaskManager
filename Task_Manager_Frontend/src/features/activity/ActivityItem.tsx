import { Box, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

export interface ActivityEvent {
  id: string;
  type: 'CREATED' | 'UPDATED' | 'ASSIGNEE_CHANGED' | 'STATUS_CHANGED' | 'COMMENT_ADDED' | 'COMPLETED';
  label: string;
  createdAt: string;
}

export function ActivityItem({ event, last }: { event: ActivityEvent; last?: boolean }) {
  const color = event.type === 'COMPLETED' ? 'success.main' : event.type === 'STATUS_CHANGED' ? 'primary.main' : 'grey.400';

  return (
    <Stack direction="row" spacing={1.5} alignItems="stretch">
      <Stack alignItems="center">
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color, mt: 0.6 }} />
        {!last && <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', my: 0.5 }} />}
      </Stack>
      <Box sx={{ pb: 2 }}>
        <Typography fontWeight={700}>{event.label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {dayjs(event.createdAt).format('MMM D, YYYY h:mm A')}
        </Typography>
      </Box>
    </Stack>
  );
}
