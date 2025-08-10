import axios from "axios";
import type { StudentData } from "../types/student";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const studentAPI = {
  getUserProfile: async (id: string, token: string) => {
  const res = await axios.get(`${API_URL}/api/auth/user/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    });
    return res.data;
  },

  getAll: async (): Promise<StudentData[]> => {
    const res = await axios.get(`${API_URL}/api/auth/getall-student`);
    return res.data;
  },

  update: async (id: string, data: Partial<StudentData>, token: string): Promise<StudentData> => {
    const res = await axios.put(`${API_URL}/api/auth/update-student/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.student;
  },

  delete: async (id: string, token: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/auth/delete-student/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  uploadAvatar: async (id: string, formData: FormData, token: string): Promise<unknown> => {
    const res = await axios.post(`${API_URL}/api/upload/avatar/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data as { message: string; avatar: string };
  },
};
