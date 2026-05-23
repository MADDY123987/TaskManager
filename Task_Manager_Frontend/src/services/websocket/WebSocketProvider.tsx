import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useEffect, type ReactNode } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import { projectApi } from '../../api/projectApi';
import { taskApi } from '../../api/taskApi';
import { notificationApi } from '../../api/notificationApi';
import { commentApi } from '../../api/commentApi';
import { activityApi } from '../../api/activityApi';
import { kanbanApi } from '../../api/kanbanApi';
import { analyticsApi } from '../../api/analyticsApi';
import { addNotification } from '../../features/notifications/notificationSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useSnackbar } from '../../hooks/useSnackbar';

interface RealtimePayload {
  title?: string;
  message?: string;
  type?: 'TASK' | 'PROJECT' | 'COMMENT' | 'SYSTEM';
  href?: string;
}

const wsUrl = import.meta.env.VITE_WS_URL ?? 'http://localhost:8080/ws';

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const token = useAppSelector((state) => state.auth.token);
  const dispatch = useAppDispatch();
  const { notify } = useSnackbar();

  useEffect(() => {
    if (!token) return undefined;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe('/user/queue/notifications', (message: IMessage) => {
          const payload = parsePayload(message.body);
          const title = payload.title ?? payload.type ?? 'New notification';
          const text = payload.message ?? 'Workspace activity received';
          dispatch(addNotification({ title, message: text, type: payload.type ?? 'SYSTEM', href: payload.href }));
          notify(text, 'info');
          dispatch(notificationApi.util.invalidateTags(['Notification']));
          dispatch(taskApi.util.invalidateTags(['Task']));
          dispatch(projectApi.util.invalidateTags(['Project']));
          dispatch(dashboardApi.util.invalidateTags(['Dashboard']));
          dispatch(commentApi.util.invalidateTags(['Comment']));
          dispatch(activityApi.util.invalidateTags(['Activity']));
          dispatch(kanbanApi.util.invalidateTags(['Board']));
          dispatch(analyticsApi.util.invalidateTags(['Analytics']));
        });
      },
    });

    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [dispatch, notify, token]);

  return children;
}

function parsePayload(body: string): RealtimePayload {
  try {
    return JSON.parse(body) as RealtimePayload;
  } catch {
    return { message: body, type: 'SYSTEM' };
  }
}
