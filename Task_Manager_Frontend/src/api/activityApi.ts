import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import type { ActivityLog, ID } from '../types/api';

export const activityApi = createApi({
  reducerPath: 'activityApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Activity'],
  endpoints: (builder) => ({
    getTaskActivity: builder.query<ActivityLog[], ID>({
      query: (taskId) => ({ url: `/api/tasks/${taskId}/activity` }),
      providesTags: (_result, _error, taskId) => [{ type: 'Activity', id: `TASK-${taskId}` }],
    }),
    getProjectActivity: builder.query<ActivityLog[], ID>({
      query: (projectId) => ({ url: `/api/projects/${projectId}/activity` }),
      providesTags: (_result, _error, projectId) => [{ type: 'Activity', id: `PROJECT-${projectId}` }],
    }),
  }),
});

export const { useGetTaskActivityQuery, useGetProjectActivityQuery } = activityApi;
