import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import type { AuthPayload, ForgotPasswordRequest, LoginRequest, MessageResponse, RegisterRequest, ResetPasswordRequest, User, VerifyOtpRequest } from '../types/api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Me'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthPayload, LoginRequest>({
      query: (data) => ({ url: '/api/auth/login', method: 'POST', data }),
      invalidatesTags: ['Me'],
    }),
    register: builder.mutation<MessageResponse, RegisterRequest>({
      query: (data) => ({ url: '/api/auth/register', method: 'POST', data }),
    }),
    verifyOtp: builder.mutation<AuthPayload, VerifyOtpRequest>({
      query: (data) => ({ url: '/api/auth/verify-otp', method: 'POST', data }),
      invalidatesTags: ['Me'],
    }),
    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (data) => ({ url: '/api/auth/forgot-password', method: 'POST', data }),
    }),
    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: (data) => ({ url: '/api/auth/reset-password', method: 'POST', data }),
    }),
    me: builder.query<User, void>({
      query: () => ({ url: '/api/auth/me' }),
      providesTags: ['Me'],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useVerifyOtpMutation, useForgotPasswordMutation, useResetPasswordMutation, useMeQuery } = authApi;
