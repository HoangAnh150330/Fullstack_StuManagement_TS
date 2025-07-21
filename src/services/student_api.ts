import type { StudentData } from "../types/student";
import { v4 as uuidv4 } from "uuid";

// Giả lập danh sách học viên (dùng tạm trong frontend)
let students: StudentData[] = [];

export const studentAPI = {
  getAll: async (): Promise<StudentData[]> => {
    return Promise.resolve(students);
  },

  create: async (data: Omit<StudentData, "id">): Promise<StudentData> => {
    const newStudent = { ...data, id: uuidv4() };
    students.push(newStudent);
    return Promise.resolve(newStudent);
  },

  update: async (id: string, data: StudentData): Promise<StudentData> => {
    students = students.map((s) => (s.id === id ? { ...data, id } : s));
    return Promise.resolve({ ...data, id });
  },

  delete: async (id: string): Promise<void> => {
    students = students.filter((s) => s.id !== id);
    return Promise.resolve();
  },
};
