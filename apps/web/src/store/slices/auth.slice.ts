import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserRole } from '@nextcommerce/shared';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const initialState: AuthState = { token: null, user: null };

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout(state) {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
