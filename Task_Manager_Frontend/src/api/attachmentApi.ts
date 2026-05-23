import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import type { Attachment, ID } from '../types/api';

export interface DownloadUrlResponse {
  url?: string;
  downloadUrl?: string;
}

export const attachmentApi = createApi({
  reducerPath: 'attachmentApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Attachment'],
  endpoints: (builder) => ({
    getTaskAttachments: builder.query<Attachment[], ID>({
      query: (taskId) => ({ url: `/api/tasks/${taskId}/attachments` }),
      providesTags: (_result, _error, taskId) => [{ type: 'Attachment', id: `TASK-${taskId}` }],
    }),
    uploadTaskAttachment: builder.mutation<Attachment, { taskId: ID; data: FormData }>({
      query: ({ taskId, data }) => ({ url: `/api/tasks/${taskId}/attachments`, method: 'POST', data }),
      invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Attachment', id: `TASK-${taskId}` }],
    }),
    getAttachmentDownloadUrl: builder.query<DownloadUrlResponse, { taskId: ID; attachmentId: ID }>({
      query: ({ taskId, attachmentId }) => ({ url: `/api/tasks/${taskId}/attachments/${attachmentId}/download-url` }),
    }),
    deleteTaskAttachment: builder.mutation<void, { taskId: ID; attachmentId: ID }>({
      query: ({ taskId, attachmentId }) => ({ url: `/api/tasks/${taskId}/attachments/${attachmentId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Attachment', id: `TASK-${taskId}` }],
    }),
  }),
});

export const {
  useGetTaskAttachmentsQuery,
  useUploadTaskAttachmentMutation,
  useLazyGetAttachmentDownloadUrlQuery,
  useDeleteTaskAttachmentMutation,
} = attachmentApi;
