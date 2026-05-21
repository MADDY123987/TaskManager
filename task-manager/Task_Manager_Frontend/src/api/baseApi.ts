import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { logout } from '../features/auth/authSlice';
import type { RootState } from '../store/store';
import type { ApiResponse } from '../types/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8080/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('authorization', `Bearer ${token}`);
    headers.set('content-type', 'application/json');
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) api.dispatch(logout());
  return result;
};

export const unwrapResponse = <T>(response: ApiResponse<T>) => response.data;

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Auth', 'Dashboard', 'Projects', 'Project', 'Tasks', 'Task'],
  endpoints: () => ({}),
});
