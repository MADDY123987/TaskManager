import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/api';
import { getStoredToken, tokenStorage } from '../utils/storage';
import { clearCredentials } from '../features/auth/authSlice';

export interface AxiosQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
}

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosQueryArgs, unknown, { status?: number; data: unknown; message: string }> =>
  async ({ url, method = 'GET', data, params }, api) => {
    try {
      const token = getStoredToken();
      const result = await axiosClient.request<ApiResponse<unknown>>({
        url,
        method,
        data,
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      return { data: result.data.data ?? result.data };
    } catch (axiosError) {
      const error = axiosError as AxiosError<ApiResponse<unknown>>;
      if (error.response?.status === 401) {
        tokenStorage.clear();
        api.dispatch(clearCredentials());
      }
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.response?.data?.message ?? error.message,
        },
      };
    }
  };
