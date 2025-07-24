import axios from "axios";
import type { classData } from "../types/class";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/classes";

export const classAPI = {
  getAll: async (): Promise<classData[]> => {
    const res = await axios.get(`${API_URL}/getall-class`);
    return res.data;
  },
  getById: async (id: string): Promise<classData> => {
    const res = await axios.get(`${API_URL}/getclass-byid/${id}`);
    return res.data;
  },
  create: async (data: Partial<classData>) => {
    const res = await axios.post(`${API_URL}/create-class`, data);
    return res.data;
  },
  update: async (id: string, data: Partial<classData>) => {
    const res = await axios.put(`${API_URL}/update-class/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    await axios.delete(`${API_URL}/delete-class/${id}`);
  },
};
