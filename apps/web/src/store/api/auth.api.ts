import { apiSlice } from '../api.slice';
import type { AuthUser } from '../slices/auth.slice';

interface LoginRequest { email: string; password: string; }
interface RegisterRequest { name: string; email: string; password: string; }
interface AuthResponse { token: string; user: AuthUser; }

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),

    register: build.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),

    getProfile: build.query<AuthUser, void>({
      query: () => '/auth/profile',
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetProfileQuery } = authApi;
