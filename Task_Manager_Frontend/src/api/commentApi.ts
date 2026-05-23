import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import type { Comment, ID } from '../types/api';

export interface CommentRequest {
  content: string;
}

export const commentApi = createApi({
  reducerPath: 'commentApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Comment'],
  endpoints: (builder) => ({
    getTaskComments: builder.query<Comment[], ID>({
      query: (taskId) => ({ url: `/api/tasks/${taskId}/comments` }),
      providesTags: (_result, _error, taskId) => [{ type: 'Comment', id: `TASK-${taskId}` }],
    }),
    addTaskComment: builder.mutation<Comment, { taskId: ID; data: CommentRequest }>({
      query: ({ taskId, data }) => ({ url: `/api/tasks/${taskId}/comments`, method: 'POST', data }),
      invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Comment', id: `TASK-${taskId}` }],
    }),
    updateTaskComment: builder.mutation<Comment, { taskId: ID; commentId: ID; data: CommentRequest }>({
      query: ({ taskId, commentId, data }) => ({ url: `/api/tasks/${taskId}/comments/${commentId}`, method: 'PUT', data }),
      invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Comment', id: `TASK-${taskId}` }],
    }),
    deleteTaskComment: builder.mutation<void, { taskId: ID; commentId: ID }>({
      query: ({ taskId, commentId }) => ({ url: `/api/tasks/${taskId}/comments/${commentId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Comment', id: `TASK-${taskId}` }],
    }),
  }),
});

export const { useGetTaskCommentsQuery, useAddTaskCommentMutation, useUpdateTaskCommentMutation, useDeleteTaskCommentMutation } = commentApi;
