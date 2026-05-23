import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import type { ID, ProjectSettings } from '../types/api';

export const projectSettingsApi = createApi({
  reducerPath: 'projectSettingsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['ProjectSettings'],
  endpoints: (builder) => ({
    getProjectSettings: builder.query<ProjectSettings, ID>({
      query: (projectId) => ({ url: `/api/projects/${projectId}/settings` }),
      providesTags: (_result, _error, projectId) => [{ type: 'ProjectSettings', id: projectId }],
    }),
    updateProjectSettings: builder.mutation<ProjectSettings, { projectId: ID; data: ProjectSettings }>({
      query: ({ projectId, data }) => ({ url: `/api/projects/${projectId}/settings`, method: 'PUT', data }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'ProjectSettings', id: projectId }],
    }),
    archiveProject: builder.mutation<void, ID>({
      query: (projectId) => ({ url: `/api/projects/${projectId}/settings/archive`, method: 'POST' }),
      invalidatesTags: (_result, _error, projectId) => [{ type: 'ProjectSettings', id: projectId }],
    }),
    restoreProject: builder.mutation<void, ID>({
      query: (projectId) => ({ url: `/api/projects/${projectId}/settings/restore`, method: 'POST' }),
      invalidatesTags: (_result, _error, projectId) => [{ type: 'ProjectSettings', id: projectId }],
    }),
    transferOwnership: builder.mutation<void, { projectId: ID; data: { userId: ID } }>({
      query: ({ projectId, data }) => ({ url: `/api/projects/${projectId}/settings/transfer-ownership`, method: 'POST', data }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'ProjectSettings', id: projectId }],
    }),
  }),
});

export const {
  useGetProjectSettingsQuery,
  useUpdateProjectSettingsMutation,
  useArchiveProjectMutation,
  useRestoreProjectMutation,
  useTransferOwnershipMutation,
} = projectSettingsApi;
