import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import type { ID, Notification, PageResponse } from '../types/api';
import type { CountLike } from '../utils/count';

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    getNotifications: builder.query<PageResponse<Notification> | Notification[], void>({
      query: () => ({ url: '/api/notifications' }),
      providesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
    getUnreadNotifications: builder.query<Notification[], void>({
      query: () => ({ url: '/api/notifications/unread' }),
      providesTags: [{ type: 'Notification', id: 'UNREAD' }],
    }),
    getUnreadCount: builder.query<CountLike, void>({
      query: () => ({ url: '/api/notifications/unread/count' }),
      providesTags: [{ type: 'Notification', id: 'COUNT' }],
    }),
    markNotificationRead: builder.mutation<Notification, ID>({
      query: (id) => ({ url: `/api/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' },
        { type: 'Notification', id: 'COUNT' },
      ],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: '/api/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD' },
        { type: 'Notification', id: 'COUNT' },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
