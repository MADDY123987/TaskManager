import { Badge } from '@mui/material';
import type { ReactNode } from 'react';
import { useGetUnreadCountQuery } from '../../api/notificationApi';
import { toCount } from '../../utils/count';

export function NotificationBadge({ children }: { children: ReactNode }) {
  const { data: unread = 0 } = useGetUnreadCountQuery(undefined, { pollingInterval: 60000 });
  const unreadCount = toCount(unread);

  if (import.meta.env.DEV) {
    console.log('unreadCount', unread);
  }

  return (
    <Badge badgeContent={unreadCount} color="error" max={99} overlap="circular">
      {children}
    </Badge>
  );
}
