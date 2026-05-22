import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authReducer } from '../features/auth/authSlice';
import { notificationReducer } from '../features/notifications/notificationSlice';
import { authApi } from '../api/authApi';
import { projectApi } from '../api/projectApi';
import { taskApi } from '../api/taskApi';
import { dashboardApi } from '../api/dashboardApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    [authApi.reducerPath]: authApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, projectApi.middleware, taskApi.middleware, dashboardApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
