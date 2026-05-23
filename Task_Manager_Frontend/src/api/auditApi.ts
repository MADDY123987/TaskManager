import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import type { AuditLog, ID } from '../types/api';

export interface AuditQuery {
  page?: number;
  size?: number;
  search?: string;
  entityType?: string;
  severity?: string;
  sort?: string;
}

export const auditApi = createApi({
  reducerPath: 'auditApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Audit'],
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLog[], AuditQuery | void>({
      query: (params) => ({ url: '/api/audit', params }),
      providesTags: [{ type: 'Audit', id: 'LIST' }],
    }),
    getMyAuditLogs: builder.query<AuditLog[], AuditQuery | void>({
      query: (params) => ({ url: '/api/audit/me', params }),
      providesTags: [{ type: 'Audit', id: 'ME' }],
    }),
    getEntityAuditLogs: builder.query<AuditLog[], { entityType: string; entityId: ID }>({
      query: ({ entityType, entityId }) => ({ url: `/api/audit/${entityType}/${entityId}` }),
      providesTags: (_result, _error, { entityType, entityId }) => [{ type: 'Audit', id: `${entityType}-${entityId}` }],
    }),
  }),
});

export const { useGetAuditLogsQuery, useGetMyAuditLogsQuery, useGetEntityAuditLogsQuery } = auditApi;
