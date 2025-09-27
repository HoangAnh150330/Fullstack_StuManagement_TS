import axios, { type AxiosInstance , AxiosError } from "axios";
import { store, type RootState } from "../redux/store";
// Import types đã tách riêng
import type { ClassData } from "../types/class";
import type { ScheduleItem } from "../types/schedule";

// ===== Axios instance + interceptor =====
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const api: AxiosInstance = axios.create({ baseURL: BASE });

function getToken(): string | undefined {
  // 1) từ Redux
  try {
    const state: RootState = store.getState();
    const t = state.auth.user?.token;
    if (t) return t;
  } catch {
    /* ignore */
  }
  // 2) fallback localStorage
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const token = (parsed?.token as string | undefined) || undefined;
    return token?.replace(/^"|"$/g, "");
  } catch {
    return;
  }
}

api.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Optional: cho phép set thủ công (nếu muốn set ngay sau login)
export function setAuthToken(token?: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

// ===== APIs =====

// Lấy danh sách lớp mở
export async function getOpenClassesAPI(): Promise<ClassData[]> {
  const { data } = await api.get<ClassData[]>("/api/classes/getall-class");
  return data;
}

// Lấy thời khóa biểu của sinh viên
export async function getMyScheduleAPI(studentId: string): Promise<ScheduleItem[]> {
  const { data } = await api.get<ScheduleItem[]>(`/api/enrollments/student/${studentId}`);
  return data;
}

// Đăng ký lớp: ưu tiên /:classId; nếu 404 thì fallback body { classId }
export async function enrollClassAPI(classId: string) {
  try {
    const { data } = await api.post(`/api/enrollments/${classId}`);
    return data;
  } catch (err: unknown) {
    // Thu hẹp về AxiosError
    const axiosErr = err as AxiosError;

    if (axiosErr.response?.status === 404) {
      const { data } = await api.post(`/api/enrollments`, { classId });
      return data;
    }
    throw err;
  }
}
export async function cancelEnrollAPI(classId: string) {
  const { data } = await api.delete(`/api/enrollments/${classId}`);
  return data;
}
