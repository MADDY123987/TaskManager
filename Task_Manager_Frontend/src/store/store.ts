import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authReducer } from '../features/auth/authSlice';
import { notificationReducer } from '../features/notifications/notificationSlice';
import { authApi } from '../api/authApi';
import { projectApi } from '../api/projectApi';
import { taskApi } from '../api/taskApi';
import { dashboardApi } from '../api/dashboardApi';
import { profileApi } from '../api/profileApi';
import { notificationApi } from '../api/notificationApi';
import { commentApi } from '../api/commentApi';
import { activityApi } from '../api/activityApi';
import { auditApi } from '../api/auditApi';
import { projectSettingsApi } from '../api/projectSettingsApi';
import { kanbanApi } from '../api/kanbanApi';
import { attachmentApi } from '../api/attachmentApi';
import { analyticsApi } from '../api/analyticsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    [authApi.reducerPath]: authApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
    [activityApi.reducerPath]: activityApi.reducer,
    [auditApi.reducerPath]: auditApi.reducer,
    [projectSettingsApi.reducerPath]: projectSettingsApi.reducer,
    [kanbanApi.reducerPath]: kanbanApi.reducer,
    [attachmentApi.reducerPath]: attachmentApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      projectApi.middleware,
      taskApi.middleware,
      dashboardApi.middleware,
      profileApi.middleware,
      notificationApi.middleware,
      commentApi.middleware,
      activityApi.middleware,
      auditApi.middleware,
      projectSettingsApi.middleware,
      kanbanApi.middleware,
      attachmentApi.middleware,
      analyticsApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
