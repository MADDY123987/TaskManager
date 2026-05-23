import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Notification } from '../../types/api';

dayjs.extend(relativeTime);

export function NotificationCard({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  const isRead = Boolean(notification.read);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: isRead ? 'background.paper' : 'rgba(37, 99, 235, 0.06)',
        borderColor: isRead ? 'divider' : 'primary.light',
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Typography fontWeight={700}>{notification.title ?? notification.type ?? 'Notification'}</Typography>
            {notification.type && <Chip size="small" label={notification.type.toLowerCase()} />}
          </Stack>
          <Typography color="text.secondary" variant="body2">
            {notification.message ?? 'Notification received'}
          </Typography>
          <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mt: 1 }}>
            {dayjs(notification.createdAt ?? notification.timestamp).fromNow()}
          </Typography>
        </Box>
        {!isRead && (
          <Button size="small" onClick={() => onRead(String(notification.id))}>
            Read
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
