import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseQuery';
import type { ID, Profile } from '../types/api';

export type UpdateProfileRequest = Pick<Profile, 'name' | 'email' | 'phone' | 'department' | 'designation' | 'bio' | 'notificationPreferences'>;

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getProfile: builder.query<Profile, void>({
      query: () => ({ url: '/api/profile' }),
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<Profile, UpdateProfileRequest>({
      query: (data) => ({ url: '/api/profile', method: 'PUT', data }),
      invalidatesTags: ['Profile'],
    }),
    updateAvatar: builder.mutation<Profile, FormData>({
      query: (data) => ({ url: '/api/profile/avatar', method: 'PATCH', data }),
      invalidatesTags: ['Profile'],
    }),
    getProfileById: builder.query<Profile, ID>({
      query: (userId) => ({ url: `/api/profile/${userId}` }),
      providesTags: (_result, _error, id) => [{ type: 'Profile', id }],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation, useUpdateAvatarMutation, useGetProfileByIdQuery } = profileApi;
