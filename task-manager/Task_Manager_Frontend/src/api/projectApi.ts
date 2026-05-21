import { baseApi, unwrapResponse } from './baseApi';
import type {
  AddMemberRequest,
  ApiResponse,
  CreateProjectRequest,
  Project,
} from '../types/api';

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      transformResponse: (response: ApiResponse<Project[]>) => unwrapResponse(response),
      providesTags: ['Projects'],
    }),
    getProject: builder.query<Project, string>({
      query: (projectId) => `/projects/${projectId}`,
      transformResponse: (response: ApiResponse<Project>) => unwrapResponse(response),
      providesTags: (_result, _error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation<Project, CreateProjectRequest>({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      transformResponse: (response: ApiResponse<Project>) => unwrapResponse(response),
      invalidatesTags: ['Projects', 'Dashboard'],
    }),
    updateProject: builder.mutation<Project, { projectId: string; body: CreateProjectRequest }>({
      query: ({ projectId, body }) => ({ url: `/projects/${projectId}`, method: 'PUT', body }),
      transformResponse: (response: ApiResponse<Project>) => unwrapResponse(response),
      invalidatesTags: (_result, _error, { projectId }) => [
        'Projects',
        { type: 'Project', id: projectId },
      ],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (projectId) => ({ url: `/projects/${projectId}`, method: 'DELETE' }),
      invalidatesTags: ['Projects', 'Dashboard'],
    }),
    addProjectMember: builder.mutation<Project, { projectId: string; body: AddMemberRequest }>({
      query: ({ projectId, body }) => ({
        url: `/projects/${projectId}/members`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Project>) => unwrapResponse(response),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'Project', id: projectId }],
    }),
    removeProjectMember: builder.mutation<void, { projectId: string; userId: string }>({
      query: ({ projectId, userId }) => ({
        url: `/projects/${projectId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'Project', id: projectId }],
    }),
  }),
});

export const {
  useAddProjectMemberMutation,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectQuery,
  useGetProjectsQuery,
  useRemoveProjectMemberMutation,
  useUpdateProjectMutation,
} = projectApi;
