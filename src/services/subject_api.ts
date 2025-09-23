// src/services/subject_api.ts
import axios from "axios";
import { store, type RootState } from "../redux/store";
import type { SubjectData } from "../types/subject";

// Chuẩn hoá base URL
const BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
const API_BASE = BASE.endsWith("/api") ? BASE : `${BASE}/api`;
const api = axios.create({ baseURL: `${API_BASE}/subjects` });

// Gắn token nếu cần auth
api.interceptors.request.use((cfg) => {
  try {
    const state = store.getState() as RootState;
    const token = state.auth.user?.token
      ?? JSON.parse(localStorage.getItem("auth_user") || "null")?.token;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  } catch {/* ignore */}
  return cfg;
});

// Helper: luôn trả về mảng
function ensureArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const d = (payload as { data?: unknown })?.data;
  return Array.isArray(d) ? (d as T[]) : [];
}

export const subjectAPI = {
  async getAll(): Promise<SubjectData[]> {
    // Đổi endpoint cho đúng với BE của bạn
    const r = await api.get("/getall-subject");
    return ensureArray<SubjectData>(r.data);
  },
  async create(data: Partial<SubjectData>) {
    const r = await api.post("/create-subject", data);
    return r.data;
  },
  async update(id: string, data: Partial<SubjectData>) {
    const r = await api.put(`/update-subject/${id}`, data);
    return r.data;
  },
  async delete(id: string) {
    await api.delete(`/delete-subject/${id}`);
  },
};
