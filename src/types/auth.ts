// types/auth.ts
export type UserRole = "admin" | "teacher" | "student";

export interface User {
  _id: string;
  email: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface VerifyOTPPayload {
  email: string;
  otp: string;
}

// ✅ form state dùng cho cả login/register
export interface AuthFormState {
  email: string;
  password: string;
  confirmPassword?: string;
  otp?: string;
}

// Response từ BE
export interface AuthResponse {
  success?: boolean;
  data?: {
    token?: string;
    accessToken?: string;
    user?: User;
    message?: string;
  };
  token?: string;
  accessToken?: string;
  user?: User;
  message?: string;
}
