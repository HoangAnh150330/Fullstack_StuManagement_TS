import axios from "axios";
import type {
  LoginPayLoad,
  RegisterPayLoad,
  VerifyOTPPayload,
  AuthResponse,
} from "../types/auth";
import type { ChangePasswordBody } from "../types/student";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const API = `${BASE}/api/auth`;

export const registerAPI = async (payload: RegisterPayLoad) => {
  const res = await axios.post<{ message?: string }>(`${API}/register`, payload);
  return res.data;
};

export const verifyOTPAPI = async (payload: VerifyOTPPayload) => {
  const res = await axios.post<{ message?: string }>(`${API}/verify-otp`, payload);
  return res.data;
};

export const loginAPI = async (payload: LoginPayLoad) => {
  const res = await axios.post<AuthResponse>(`${API}/login`, payload);
  return res.data;
};

export const resendOTPAPI = async (payload: { email: string }) => {
  const res = await axios.post<{ message?: string }>(`${API}/resend-otp`, payload);
  return res.data;
};

// ✅ đổi mật khẩu
export const changePasswordAPI = async (
  userId: string,
  body: ChangePasswordBody,
  token: string
) => {
  const res = await axios.put<{ message?: string }>(
    `${API}/students/${userId}/change-password`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
