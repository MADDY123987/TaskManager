import { baseApi, unwrapResponse } from './baseApi';
import type { ApiResponse, AuthPayload, LoginRequest, SignupRequest, User } from '../types/api';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthPayload, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response: ApiResponse<AuthPayload>) => unwrapResponse(response),
      invalidatesTags: ['Auth'],
    }),
    signup: builder.mutation<AuthPayload, SignupRequest>({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
      transformResponse: (response: ApiResponse<AuthPayload>) => unwrapResponse(response),
      invalidatesTags: ['Auth'],
    }),
    me: builder.query<User, void>({
      query: () => '/auth/me',
      transformResponse: (response: ApiResponse<User>) => unwrapResponse(response),
      providesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation, useMeQuery, useSignupMutation } = authApi;
