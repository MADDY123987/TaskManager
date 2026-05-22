import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'TASK' | 'PROJECT' | 'COMMENT' | 'SYSTEM';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  href?: string;
}

interface NotificationsState {
  items: Notification[];
  page: number;
  pageSize: number;
  loading: boolean;
}

const seedNotifications: Notification[] = [
  {
    id: 'seed-1',
    title: 'Task status changed',
    message: 'A task moved to In progress.',
    type: 'TASK',
    read: false,
    createdAt: new Date().toISOString(),
    href: '/my-tasks',
  },
  {
    id: 'seed-2',
    title: 'Project updated',
    message: 'Project details were recently updated.',
    type: 'PROJECT',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    href: '/projects',
  },
];

const initialState: NotificationsState = {
  items: seedNotifications,
  page: 1,
  pageSize: 6,
  loading: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: {
      reducer: (state, action: PayloadAction<Notification>) => {
        state.items.unshift(action.payload);
      },
      prepare: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'> & Partial<Pick<Notification, 'id' | 'read' | 'createdAt'>>) => ({
        payload: {
          id: notification.id ?? nanoid(),
          title: notification.title,
          message: notification.message,
          type: notification.type,
          href: notification.href,
          read: notification.read ?? false,
          createdAt: notification.createdAt ?? new Date().toISOString(),
        },
      }),
    },
    markRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find((notification) => notification.id === action.payload);
      if (item) item.read = true;
    },
    markUnread: (state, action: PayloadAction<string>) => {
      const item = state.items.find((notification) => notification.id === action.payload);
      if (item) item.read = false;
    },
    markAllRead: (state) => {
      state.items.forEach((notification) => {
        notification.read = true;
      });
    },
    setNotificationPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setNotificationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { addNotification, markRead, markUnread, markAllRead, setNotificationPage, setNotificationLoading } = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;
