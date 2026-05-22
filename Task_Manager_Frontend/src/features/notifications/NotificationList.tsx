import { Box, Pagination, Skeleton, Stack } from '@mui/material';
import { EmptyState } from '../../components/common/EmptyState';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { markRead, markUnread, setNotificationPage } from './notificationSlice';
import { selectNotificationLoading, selectNotificationPage, selectNotificationPageSize, selectNotifications } from './selectors';
import { NotificationCard } from './NotificationCard';

export function NotificationList() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const page = useAppSelector(selectNotificationPage);
  const pageSize = useAppSelector(selectNotificationPageSize);
  const loading = useAppSelector(selectNotificationLoading);
  const start = (page - 1) * pageSize;
  const visible = notifications.slice(start, start + pageSize);
  const pages = Math.max(Math.ceil(notifications.length / pageSize), 1);

  if (loading) {
    return (
      <Stack spacing={1.5}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={96} />
        ))}
      </Stack>
    );
  }

  if (!notifications.length) {
    return <EmptyState title="No notifications" description="New activity and mentions will appear here." />;
  }

  return (
    <Stack spacing={1.5}>
      {visible.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} onRead={(id) => dispatch(markRead(id))} onUnread={(id) => dispatch(markUnread(id))} />
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
        <Pagination count={pages} page={page} onChange={(_, value) => dispatch(setNotificationPage(value))} size="small" />
      </Box>
    </Stack>
  );
}
