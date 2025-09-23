// types/class.ts
export type TimeSlot = { day: string; slot: string };

export interface classData {
  _id: string;
  name: string;
  subject: string;
  teacherId: string;       
  timeSlots: TimeSlot[];
  maxStudents: number; 
  teacherName?: string;
}

// Dùng riêng type cho form để TS hiểu, tránh any
export type ClassFormValues = {
  name: string;
  subject: string;
  teacherId: string;
  maxStudents: number;
  timeSlots: TimeSlot[];
};
