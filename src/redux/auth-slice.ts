import { createSlice,type PayloadAction } from "@reduxjs/toolkit";

export type Role = "admin" | "teacher" | "student";
export interface AuthUser {
  _id: string;
  email: string;
  role: Role;
  token: string; // JWT
}

interface AuthState {
  user: AuthUser | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem("auth_user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("auth_user");
      }
    },
    loadUserFromStorage(state) {
      const raw = localStorage.getItem("auth_user");
      state.user = raw ? (JSON.parse(raw) as AuthUser) : null;
    },
    logout(state) {
      state.user = null;
      localStorage.removeItem("auth_user");
    },
  },
});

export const { setUser, loadUserFromStorage, logout } = authSlice.actions;
export default authSlice.reducer;
