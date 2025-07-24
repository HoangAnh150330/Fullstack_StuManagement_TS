import axios from "axios";
import type { SubjectData } from "../types/subject";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/subjects";

export const subjectAPI = {
  getAll: async (): Promise<SubjectData[]> => {
    const res = await axios.get(`${API_URL}/getall-subject`);
    return res.data;
  },
  create: async (data: Partial<SubjectData>) => {
    const res = await axios.post(`${API_URL}/create-subject`, data);
    return res.data;
  },
  update: async (id: string, data: Partial<SubjectData>) => {
    const res = await axios.put(`${API_URL}/update-subject/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    await axios.delete(`${API_URL}/delete-subject/${id}`);
  },
};
