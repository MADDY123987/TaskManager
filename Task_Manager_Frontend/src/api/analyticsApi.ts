import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import type { ID, ProjectAnalytics } from '../types/api';

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Analytics'],
  endpoints: (builder) => ({
    getProjectAnalytics: builder.query<ProjectAnalytics, ID>({
      query: (projectId) => ({ url: `/api/projects/${projectId}/analytics` }),
      providesTags: (_result, _error, projectId) => [{ type: 'Analytics', id: projectId }],
    }),
  }),
});

export const { useGetProjectAnalyticsQuery } = analyticsApi;
