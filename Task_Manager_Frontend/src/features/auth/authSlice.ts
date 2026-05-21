import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/api';
import { getStoredToken, tokenStorage } from '../../utils/storage';

interface AuthState {
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  token: getStoredToken(),
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: User; remember?: boolean }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      tokenStorage.set(action.payload.token, action.payload.remember ?? true);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      tokenStorage.clear();
    },
  },
});

export const { setCredentials, setUser, clearCredentials } = authSlice.actions;
export const authReducer = authSlice.reducer;
