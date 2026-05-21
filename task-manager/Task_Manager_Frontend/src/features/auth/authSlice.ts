import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/api';
import { tokenStorage } from '../../utils/storage';

interface AuthState {
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  token: tokenStorage.get(),
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      tokenStorage.set(action.payload.token);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      tokenStorage.clear();
    },
  },
});

export const { logout, setCredentials, setUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
