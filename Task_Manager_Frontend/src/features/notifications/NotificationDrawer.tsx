import { Box, Button, Drawer, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { markAllRead } from './notificationSlice';
import { selectUnreadCount } from './selectors';
import { NotificationList } from './NotificationList';

export function NotificationDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const unread = useAppSelector(selectUnreadCount);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 460 }, p: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">Notifications</Typography>
          <Typography color="text.secondary" variant="body2">
            {unread} unread
          </Typography>
        </Box>
        <Button size="small" onClick={() => dispatch(markAllRead())} disabled={!unread}>
          Mark all read
        </Button>
      </Stack>
      <NotificationList />
    </Drawer>
  );
}
