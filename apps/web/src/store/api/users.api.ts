import { apiSlice } from '../api.slice';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

interface PaginatedUsers {
  data: UserSummary[];
  total: number;
  page: number;
  totalPages: number;
}

interface UpdateProfileRequest {
  name?: string;
}

interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<UserSummary, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),

    updateMe: build.mutation<UserSummary, UpdateProfileRequest>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),

    changePassword: build.mutation<void, UpdatePasswordRequest>({
      query: (body) => ({ url: '/users/me/password', method: 'PATCH', body }),
    }),

    listUsers: build.query<PaginatedUsers, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => `/users?page=${page}&limit=${limit}`,
      providesTags: ['User'],
    }),

    getUserById: build.query<UserSummary, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),

    updateUser: build.mutation<UserSummary, { id: string; name?: string; role?: 'customer' | 'admin' }>({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => ['User', { type: 'User' as const, id }],
    }),

    deleteUser: build.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),

    searchUsers: build.query<UserSummary[], { q: string; limit?: number }>({
      query: ({ q, limit = 20 }) =>
        `/users/admin/search?q=${encodeURIComponent(q)}&limit=${limit}`,
      providesTags: ['User'],
    }),

    getAdminUserStats: build.query<{
      total: number; admins: number; customers: number; newThisMonth: number;
    }, void>({
      query: () => '/users/admin/stats',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useChangePasswordMutation,
  useListUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useSearchUsersQuery,
  useGetAdminUserStatsQuery,
} = usersApi;
