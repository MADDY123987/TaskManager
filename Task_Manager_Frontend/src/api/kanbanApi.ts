import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import type { Board, BoardColumn, ID } from '../types/api';

export interface ColumnRequest {
  name: string;
}

export interface ReorderColumnsRequest {
  columnIds: ID[];
}

export interface MoveTaskRequest {
  sourceColumnId?: ID;
  targetColumnId: ID;
  position?: number;
}

export const kanbanApi = createApi({
  reducerPath: 'kanbanApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Board'],
  endpoints: (builder) => ({
    getProjectBoard: builder.query<Board, ID>({
      query: (projectId) => ({ url: `/api/projects/${projectId}/board` }),
      providesTags: (_result, _error, projectId) => [{ type: 'Board', id: projectId }],
    }),
    getBoardColumns: builder.query<BoardColumn[], ID>({
      query: (projectId) => ({ url: `/api/projects/${projectId}/board/columns` }),
      providesTags: (_result, _error, projectId) => [{ type: 'Board', id: `COLUMNS-${projectId}` }],
    }),
    createBoardColumn: builder.mutation<BoardColumn, { projectId: ID; data: ColumnRequest }>({
      query: ({ projectId, data }) => ({ url: `/api/projects/${projectId}/board/columns`, method: 'POST', data }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'Board', id: projectId }, { type: 'Board', id: `COLUMNS-${projectId}` }],
    }),
    updateBoardColumn: builder.mutation<BoardColumn, { projectId: ID; columnId: ID; data: ColumnRequest }>({
      query: ({ projectId, columnId, data }) => ({ url: `/api/projects/${projectId}/board/columns/${columnId}`, method: 'PUT', data }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'Board', id: projectId }, { type: 'Board', id: `COLUMNS-${projectId}` }],
    }),
    deleteBoardColumn: builder.mutation<void, { projectId: ID; columnId: ID }>({
      query: ({ projectId, columnId }) => ({ url: `/api/projects/${projectId}/board/columns/${columnId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'Board', id: projectId }, { type: 'Board', id: `COLUMNS-${projectId}` }],
    }),
    reorderBoardColumns: builder.mutation<BoardColumn[], { projectId: ID; data: ReorderColumnsRequest }>({
      query: ({ projectId, data }) => ({ url: `/api/projects/${projectId}/board/columns/reorder`, method: 'PATCH', data }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'Board', id: projectId }, { type: 'Board', id: `COLUMNS-${projectId}` }],
    }),
    moveBoardTask: builder.mutation<Board, { projectId: ID; taskId: ID; data: MoveTaskRequest }>({
      query: ({ projectId, taskId, data }) => ({ url: `/api/projects/${projectId}/board/tasks/${taskId}/move`, method: 'PATCH', data }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'Board', id: projectId }],
    }),
  }),
});

export const {
  useGetProjectBoardQuery,
  useGetBoardColumnsQuery,
  useCreateBoardColumnMutation,
  useUpdateBoardColumnMutation,
  useDeleteBoardColumnMutation,
  useReorderBoardColumnsMutation,
  useMoveBoardTaskMutation,
} = kanbanApi;
