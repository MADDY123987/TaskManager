import { baseApi, unwrapResponse } from './baseApi';
import type { ApiResponse, DashboardData } from '../types/api';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardData, void>({
      query: () => '/dashboard',
      transformResponse: (response: ApiResponse<DashboardData>) => unwrapResponse(response),
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
