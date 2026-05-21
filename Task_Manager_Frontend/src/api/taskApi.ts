import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import { axiosClient } from './axiosClient';
import type { ApiResponse, CreateTaskRequest, ID, Project, Task, UpdateTaskStatusRequest, User } from '../types/api';

export const taskApi = createApi({
  reducerPath: 'taskApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getProjectTasks: builder.query<Task[], ID>({
      query: (projectId) => ({ url: `/api/projects/${projectId}/tasks` }),
      providesTags: (result, _error, projectId) =>
        result
          ? [
              ...result.map((task) => ({ type: 'Task' as const, id: task.id })),
              { type: 'Task', id: `PROJECT-${projectId}` },
            ]
          : [{ type: 'Task', id: `PROJECT-${projectId}` }],
    }),
    getTask: builder.query<Task, ID>({
      query: (taskId) => ({ url: `/api/tasks/${taskId}` }),
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),
    createTask: builder.mutation<Task, { projectId: ID; data: CreateTaskRequest }>({
      query: ({ projectId, data }) => ({ url: `/api/projects/${projectId}/tasks`, method: 'POST', data }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'Task', id: `PROJECT-${projectId}` }],
    }),
    updateTask: builder.mutation<Task, { taskId: ID; data: CreateTaskRequest }>({
      query: ({ taskId, data }) => ({ url: `/api/tasks/${taskId}`, method: 'PUT', data }),
      invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Task', id: taskId }],
    }),
    updateTaskStatus: builder.mutation<Task, { taskId: ID; data: UpdateTaskStatusRequest }>({
      query: ({ taskId, data }) => ({ url: `/api/tasks/${taskId}/status`, method: 'PATCH', data }),
      invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Task', id: taskId }],
    }),
    deleteTask: builder.mutation<void, ID>({
      query: (taskId) => ({ url: `/api/tasks/${taskId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, taskId) => [{ type: 'Task', id: taskId }],
    }),
    getMyTasks: builder.query<Task[], User | null>({
      async queryFn(user) {
        if (!user) return { data: [] };
        try {
          const projectsResponse = await axiosClient.get<ApiResponse<Project[]>>('/api/projects');
          const projects = projectsResponse.data.data ?? [];
          const taskResponses = await Promise.all(
            projects.map((project) => axiosClient.get<ApiResponse<Task[]>>(`/api/projects/${project.id}/tasks`)),
          );
          const tasks = taskResponses.flatMap((response) => response.data.data ?? []);
          const mine = tasks.filter((task) => {
            const assigned = task.assignee?.id ?? (typeof task.assignedTo === 'object' ? task.assignedTo?.id : task.assignedTo);
            return String(assigned) === String(user.id);
          });
          return { data: mine };
        } catch {
          return { error: { status: 500, data: null, message: 'Could not load assigned tasks' } };
        }
      },
      providesTags: [{ type: 'Task', id: 'MY_TASKS' }],
    }),
  }),
});

export const {
  useGetProjectTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  useGetMyTasksQuery,
} = taskApi;
