import { Box, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import type { ActivityLog } from '../../types/api';

export function ActivityItem({ event, last }: { event: ActivityLog; last?: boolean }) {
  const type = event.type ?? 'ACTIVITY';
  const color = type === 'COMPLETED' ? 'success.main' : type === 'STATUS_CHANGED' ? 'primary.main' : 'grey.400';

  return (
    <Stack direction="row" spacing={1.5} alignItems="stretch">
      <Stack alignItems="center">
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color, mt: 0.6 }} />
        {!last && <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', my: 0.5 }} />}
      </Stack>
      <Box sx={{ pb: 2 }}>
        <Typography fontWeight={700}>{event.summary ?? event.description ?? type}</Typography>
        {(event.actor?.name || event.actorName) && (
          <Typography variant="body2" color="text.secondary">
            {event.actor?.name ?? event.actorName}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {dayjs(event.createdAt ?? event.timestamp).format('MMM D, YYYY h:mm A')}
        </Typography>
      </Box>
    </Stack>
  );
}
