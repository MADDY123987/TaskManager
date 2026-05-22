import { IconButton, Tooltip } from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useState } from 'react';
import { NotificationBadge } from './NotificationBadge';
import { NotificationDrawer } from './NotificationDrawer';

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton aria-label="Open notifications" onClick={() => setOpen(true)}>
          <NotificationBadge>
            <NotificationsOutlinedIcon />
          </NotificationBadge>
        </IconButton>
      </Tooltip>
      <NotificationDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
