import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import type { AuthPayload, LoginRequest, SignupRequest, User } from '../types/api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Me'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthPayload, LoginRequest>({
      query: (data) => ({ url: '/api/auth/login', method: 'POST', data }),
      invalidatesTags: ['Me'],
    }),
    signup: builder.mutation<AuthPayload, SignupRequest>({
      query: (data) => ({ url: '/api/auth/signup', method: 'POST', data }),
      invalidatesTags: ['Me'],
    }),
    me: builder.query<User, void>({
      query: () => ({ url: '/api/auth/me' }),
      providesTags: ['Me'],
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useMeQuery } = authApi;
