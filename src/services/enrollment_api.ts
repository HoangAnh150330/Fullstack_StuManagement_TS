// src/services/enrollment_api.ts
import axios, { type AxiosInstance } from "axios";
import { store, type RootState } from "../redux/store";

// ===== Types =====
export type TimeSlot = { day: string; slot: string };

export type ClassItem = {
  _id: string;
  name: string;
  subject: string;
  teacher: string;
  maxStudents: number;
  timeSlots: TimeSlot[];
};

export type ScheduleItem = {
  classId?: string;          // BE mới có thể trả kèm
  className: string;
  subject: string;
  teacher: string;
  timeSlots: TimeSlot[];
};

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
  // 2) fallback localStorage (phòng lúc user refresh mà Redux chưa kịp khởi tạo)
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

// Optional: cho phép set thủ công (nếu bạn muốn set ngay sau login)
export function setAuthToken(token?: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

// ===== APIs =====

// Lấy danh sách lớp mở (khớp route hiện có của bạn)
export async function getOpenClassesAPI(): Promise<ClassItem[]> {
  const { data } = await api.get<ClassItem[]>("/api/classes/getall-class");
  return data;
}

// Lấy thời khóa biểu của sinh viên (cần Authorization header)
export async function getMyScheduleAPI(studentId: string): Promise<ScheduleItem[]> {
  const { data } = await api.get(`/api/enrollments/student/${studentId}`);
  return data as ScheduleItem[];
}

// Đăng ký lớp: ưu tiên /:classId; nếu 404 thì fallback body { classId }
export async function enrollClassAPI(classId: string) {
  try {
    const { data } = await api.post(`/api/enrollments/${classId}`);
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      const { data } = await api.post(`/api/enrollments`, { classId });
      return data;
    }
    throw err;
  }
}

// Hủy đăng ký: ưu tiên /:classId; nếu 404 thì fallback body { classId }
export async function cancelEnrollAPI(classId: string) {
  try {
    const { data } = await api.delete(`/api/enrollments/${classId}`);
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      const { data } = await api.delete(`/api/enrollments`, { data: { classId } });
      return data;
    }
    throw err;
  }
}
