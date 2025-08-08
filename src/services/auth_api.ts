import type { LoginPayLoad, RegisterPayLoad, VerifyOTPPayload } from "../types/auth";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/auth";

export const registerAPI = async (payload: RegisterPayLoad) => {
  const res = await axios.post(`${BASE_URL}/register`, payload);
  return res.data;
};

export const verifyOTPAPI = async (payload: VerifyOTPPayload) => {
  const res = await axios.post(`${BASE_URL}/verify-otp`, payload);
  return res.data;
};

export const loginAPI = async (payload: LoginPayLoad) => {
  const res = await axios.post(`${BASE_URL}/login`, payload);
  return res.data;
};
export const resendOTPAPI  = async (payload: { email:string}) => {
  const res = await axios.post(`${BASE_URL}/resend-otp`, payload);
  return res.data;
};

