import { Badge } from '@mui/material';
import type { ReactNode } from 'react';
import { useAppSelector } from '../../hooks/redux';
import { selectUnreadCount } from './selectors';

export function NotificationBadge({ children }: { children: ReactNode }) {
  const unread = useAppSelector(selectUnreadCount);
  return (
    <Badge badgeContent={unread} color="error" max={99} overlap="circular">
      {children}
    </Badge>
  );
}
