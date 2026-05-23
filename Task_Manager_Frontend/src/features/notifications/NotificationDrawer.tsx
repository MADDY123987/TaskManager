import { Box, Button, Drawer, Stack, Typography } from '@mui/material';
import { NotificationList } from './NotificationList';
import { useGetUnreadCountQuery, useGetUnreadNotificationsQuery, useMarkAllNotificationsReadMutation } from '../../api/notificationApi';

export function NotificationDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: unread = 0 } = useGetUnreadCountQuery();
  useGetUnreadNotificationsQuery(undefined, { skip: !open });
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 460 }, p: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">Notifications</Typography>
          <Typography color="text.secondary" variant="body2">
            {unread} unread
          </Typography>
        </Box>
        <Button size="small" onClick={() => markAllRead()} disabled={!unread}>
          Mark all read
        </Button>
      </Stack>
      <NotificationList />
    </Drawer>
  );
}
