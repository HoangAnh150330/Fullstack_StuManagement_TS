import type { LoginPayLoad, RegisterPayLoad } from "../types/auth";

export const loginAPI = async (payload:LoginPayLoad) =>{
  console.log("Gưi yêu cầu đăng nhập:",payload);
  return new Promise((resolve) => setTimeout(resolve,1000));
}

export const registerAPI = async (payload:RegisterPayLoad) =>{
  console.log("Gưi yêu cầu đăng nhập:",payload);
  return new Promise((resolve) => setTimeout(resolve,1000));
}