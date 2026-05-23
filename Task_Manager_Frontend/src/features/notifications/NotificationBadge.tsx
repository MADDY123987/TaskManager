import { Badge } from '@mui/material';
import type { ReactNode } from 'react';
import { useGetUnreadCountQuery } from '../../api/notificationApi';

export function NotificationBadge({ children }: { children: ReactNode }) {
  const { data: unread = 0 } = useGetUnreadCountQuery(undefined, { pollingInterval: 60000 });
  return (
    <Badge badgeContent={unread} color="error" max={99} overlap="circular">
      {children}
    </Badge>
  );
}
