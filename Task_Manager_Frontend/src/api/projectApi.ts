import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import type { AddMemberRequest, CreateProjectRequest, ID, Project } from '../types/api';

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Project'],
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => ({ url: '/api/projects' }),
      providesTags: (result) =>
        result
          ? [...result.map((project) => ({ type: 'Project' as const, id: project.id })), { type: 'Project', id: 'LIST' }]
          : [{ type: 'Project', id: 'LIST' }],
    }),
    getProject: builder.query<Project, ID>({
      query: (projectId) => ({ url: `/api/projects/${projectId}` }),
      providesTags: (_result, _error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation<Project, CreateProjectRequest>({
      query: (data) => ({ url: '/api/projects', method: 'POST', data }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
    updateProject: builder.mutation<Project, { projectId: ID; data: CreateProjectRequest }>({
      query: ({ projectId, data }) => ({ url: `/api/projects/${projectId}`, method: 'PUT', data }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'Project', id: 'LIST' },
      ],
    }),
    deleteProject: builder.mutation<void, ID>({
      query: (projectId) => ({ url: `/api/projects/${projectId}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
    addMember: builder.mutation<Project, { projectId: ID; data: AddMemberRequest }>({
      query: ({ projectId, data }) => ({ url: `/api/projects/${projectId}/members`, method: 'POST', data }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'Project', id: projectId }],
    }),
    removeMember: builder.mutation<Project, { projectId: ID; userId: ID }>({
      query: ({ projectId, userId }) => ({ url: `/api/projects/${projectId}/members/${userId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'Project', id: projectId }],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddMemberMutation,
  useRemoveMemberMutation,
} = projectApi;
