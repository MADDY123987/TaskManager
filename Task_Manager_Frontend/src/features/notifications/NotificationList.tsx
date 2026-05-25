import { Box, Pagination, Skeleton, Stack } from '@mui/material';
import { EmptyState } from '../../components/common/EmptyState';
import { NotificationCard } from './NotificationCard';
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from '../../api/notificationApi';
import { useState } from 'react';
import type { Notification, PageResponse } from '../../types/api';

export function NotificationList() {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const { data: notifications = [], isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  console.log('notifications response', notifications);
  const items = getNotificationItems(notifications);
  const start = (page - 1) * pageSize;
  const visible = items.slice(start, start + pageSize);
  const pages = Math.max(Math.ceil(items.length / pageSize), 1);

  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={96} />
        ))}
      </Stack>
    );
  }

  if (!items.length) {
    return <EmptyState title="No notifications" description="New activity and mentions will appear here." />;
  }

  return (
    <Stack spacing={1.5}>
      {visible.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} onRead={(id) => markRead(id)} />
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
        <Pagination count={pages} page={page} onChange={(_, value) => setPage(value)} size="small" />
      </Box>
    </Stack>
  );
}

function getNotificationItems(response: PageResponse<Notification> | Notification[]) {
  if (Array.isArray(response)) return response;
  return response.content ?? [];
}
