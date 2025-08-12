export interface LoginPayLoad {
  email: string;
  password: string;
}

export interface RegisterPayLoad {
  email: string;
  password: string;
}

export interface VerifyOTPPayload {
  email: string;
  otp: string;
}

// ==== Bổ sung để fix lỗi ====
export type Role = "student" | "teacher" | "admin"; // thêm 'teacher' nếu BE có

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface AuthResponse {
  message?: string;
  token: string;
  user: AuthUser;
}
