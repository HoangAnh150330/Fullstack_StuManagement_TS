import axios from "axios";
import type { Announcement } from "../types/announcement";

const BASE = "http://localhost:3000/api/announcements";

const api = axios.create({ baseURL: BASE });

// Thêm interceptor token
function getToken() {
  const raw = localStorage.getItem("auth_user");
  if (raw) {
    const parsed = JSON.parse(raw);
    return parsed?.token?.replace(/^"|"$/g, "");
  }
  return undefined;
}

api.interceptors.request.use((cfg) => {
  const token = getToken();
  console.log(">>> TOKEN FOR ANNOUNCEMENT:", token);
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const announceAPI = {
  send: async (classId: string, title: string): Promise<Announcement> => {
    const res = await api.post<Announcement>(`${BASE}`, { classId, title });
    return res.data;
  },

  getByClass: async (classId: string): Promise<Announcement[]> => {
    const res = await api.get<Announcement[]>(`${BASE}/${classId}`);
    return res.data;
  },

  getForStudent: async (): Promise<{ success: boolean; data: Announcement[] }> => {
    const res = await api.get<{ success: boolean; data: Announcement[] }>(`${BASE}/student/mine`);
    return res.data; // Trả về { success, data }
  },
};