import api from "./api";
import type { StudentData } from "../types/student";

// BE routes (đã mount ở app.use("/api/admin/students", studentRoutes))
const BASE = "/admin/students";

export const studentAPI = {
  /** Lấy danh sách học viên (ADMIN) */
  getAll: async (): Promise<StudentData[]> => {
    const res = await api.get<StudentData[]>(`${BASE}`);
    return res.data;
  },

  /** Lấy hồ sơ theo id (ADMIN/TEACHER xem bất kỳ; STUDENT xem chính mình) */
  getUserProfile: async (id: string): Promise<StudentData> => {
    const res = await api.get<StudentData>(`${BASE}/${id}`);
    return res.data;
  },

  /** Cập nhật hồ sơ (ADMIN được cập nhật bất kỳ; STUDENT chỉ cập nhật chính mình) */
  update: async (id: string, data: Partial<StudentData>) => {
    // Controller trả { message, student } → ưu tiên lấy student
    const res = await api.patch<{ message: string; student: StudentData }>(`${BASE}/${id}`, data);
    return res.data.student ?? (res.data as unknown as StudentData);
  },

  /** Xoá học viên (ADMIN) */
  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },

  /** Upload avatar (ADMIN hoặc chính chủ); formData chứa field 'file' */
  uploadAvatar: async (id: string, formData: FormData) => {
    const res = await api.post<{ message: string; avatar: string }>(
      `${BASE}/${id}/avatar`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data; // { message, avatar }
  },
};
