export interface LoginPayLoad {
  email: string;
  password: string;
}

export interface RegisterPayLoad {
  fullName: string;
  email: string;
  password: string;
}

export interface VerifyOTPPayload {
  email: string;
  otp: string;
}
