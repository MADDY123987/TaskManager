import { baseApi, unwrapResponse } from './baseApi';
import type { ApiResponse, CreateTaskRequest, Task, TaskStatus, UpdateTaskRequest } from '../types/api';

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjectTasks: builder.query<Task[], string>({
      query: (projectId) => `/projects/${projectId}/tasks`,
      transformResponse: (response: ApiResponse<Task[]>) => unwrapResponse(response),
      providesTags: (_result, _error, projectId) => [{ type: 'Tasks', id: projectId }],
    }),
    getTask: builder.query<Task, string>({
      query: (taskId) => `/tasks/${taskId}`,
      transformResponse: (response: ApiResponse<Task>) => unwrapResponse(response),
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),
    createTask: builder.mutation<Task, { projectId: string; body: CreateTaskRequest }>({
      query: ({ projectId, body }) => ({ url: `/projects/${projectId}/tasks`, method: 'POST', body }),
      transformResponse: (response: ApiResponse<Task>) => unwrapResponse(response),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Tasks', id: projectId },
        'Dashboard',
      ],
    }),
    updateTask: builder.mutation<Task, { taskId: string; body: UpdateTaskRequest; projectId?: string }>({
      query: ({ taskId, body }) => ({ url: `/tasks/${taskId}`, method: 'PUT', body }),
      transformResponse: (response: ApiResponse<Task>) => unwrapResponse(response),
      invalidatesTags: (_result, _error, { taskId, projectId }) => [
        { type: 'Task', id: taskId },
        ...(projectId ? [{ type: 'Tasks' as const, id: projectId }] : []),
        'Dashboard',
      ],
    }),
    updateTaskStatus: builder.mutation<Task, { taskId: string; status: TaskStatus; projectId?: string }>({
      query: ({ taskId, status }) => ({ url: `/tasks/${taskId}/status`, method: 'PATCH', body: { status } }),
      transformResponse: (response: ApiResponse<Task>) => unwrapResponse(response),
      invalidatesTags: (_result, _error, { taskId, projectId }) => [
        { type: 'Task', id: taskId },
        ...(projectId ? [{ type: 'Tasks' as const, id: projectId }] : []),
        'Dashboard',
      ],
    }),
    deleteTask: builder.mutation<void, { taskId: string; projectId?: string }>({
      query: ({ taskId }) => ({ url: `/tasks/${taskId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { taskId, projectId }) => [
        { type: 'Task', id: taskId },
        ...(projectId ? [{ type: 'Tasks' as const, id: projectId }] : []),
        'Dashboard',
      ],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetProjectTasksQuery,
  useLazyGetProjectTasksQuery,
  useGetTaskQuery,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
} = taskApi;
