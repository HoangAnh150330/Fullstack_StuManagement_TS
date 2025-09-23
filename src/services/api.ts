// src/services/api.ts
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { store } from "../redux/store"; // đường dẫn tới store của bạn

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000/api",
});

api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const state = store.getState();
  const token = state.auth.user?.token;

  console.log("[axios]", cfg.method?.toUpperCase(), cfg.url, "token?", !!token);

  if (token) {
    cfg.headers = AxiosHeaders.from(cfg.headers || {});
    (cfg.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }

  return cfg;
});

export default api;
