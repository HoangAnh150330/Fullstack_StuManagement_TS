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
