import api from "./api"; 
import type {
  LoginPayload,
  RegisterPayload,
  VerifyOTPPayload,
  AuthResponse,
  User,
} from "../types/auth";
import type { ChangePasswordBody } from "../types/student";

// Chuẩn hoá baseURL
const BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");
const AUTH = BASE.endsWith("/api") ? `${BASE}/auth` : `${BASE}/api/auth`;

// Helper: unwrap về { token, user, message }
function normalizeAuth(d: AuthResponse) {
  const token   = d?.data?.token   ?? d?.token   ?? d?.accessToken;
  const user    = d?.data?.user    ?? d?.user;
  const message = d?.data?.message ?? d?.message;
  return { token, user, message };
}

export const registerAPI = async (payload: RegisterPayload) => {
  const res = await api.post<{ message?: string }>(`${AUTH}/register`, payload);
  return res.data;
};

export const verifyOTPAPI = async (payload: VerifyOTPPayload) => {
  const res = await api.post<{ message?: string }>(`${AUTH}/verify-otp`, payload);
  return res.data;
};

export const loginAPI = async (payload: LoginPayload) => {
  const res = await api.post<AuthResponse>(`${AUTH}/login`, payload);
  const { token, user, message } = normalizeAuth(res.data);
  if (!token || !user) throw new Error("INVALID_RESPONSE");
  return { token, user: user as User, message };
};

export const resendOTPAPI = async (payload: { email: string }) => {
  const res = await api.post<{ message?: string }>(`${AUTH}/resend-otp`, payload);
  return res.data;
};

export const changePasswordAPI = async (
  userId: string,
  body: ChangePasswordBody,
  token: string
) => {
  const res = await api.put<{ message?: string }>(
    `${AUTH}/students/${userId}/change-password`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
