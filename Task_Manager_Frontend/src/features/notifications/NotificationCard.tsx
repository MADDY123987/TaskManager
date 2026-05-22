import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Notification } from './notificationSlice';

dayjs.extend(relativeTime);

export function NotificationCard({
  notification,
  onRead,
  onUnread,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onUnread: (id: string) => void;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: notification.read ? 'background.paper' : 'rgba(37, 99, 235, 0.06)',
        borderColor: notification.read ? 'divider' : 'primary.light',
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Typography fontWeight={700}>{notification.title}</Typography>
            <Chip size="small" label={notification.type.toLowerCase()} />
          </Stack>
          <Typography color="text.secondary" variant="body2">
            {notification.message}
          </Typography>
          <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mt: 1 }}>
            {dayjs(notification.createdAt).fromNow()}
          </Typography>
        </Box>
        <Button size="small" onClick={() => (notification.read ? onUnread(notification.id) : onRead(notification.id))}>
          {notification.read ? 'Unread' : 'Read'}
        </Button>
      </Stack>
    </Paper>
  );
}
