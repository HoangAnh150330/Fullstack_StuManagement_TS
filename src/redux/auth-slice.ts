import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  token: localStorage.getItem("token") || null,
  user: null,
};

try {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    initialState.user = JSON.parse(storedUser);
  }
} catch (e) {
  console.error("Failed to parse user from localStorage:", e);
  localStorage.removeItem("user"); // Xóa dữ liệu lỗi
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{
        token: string;
        user: User;
      }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;

      // Lưu vào localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;