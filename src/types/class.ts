// TimeSlot tái sử dụng nhiều nơi
export type TimeSlot = {
  day: string;
  slot: string;
};

export interface ClassData {
  _id: string;
  name: string;
  subject: string;
  teacherId: string;
  timeSlots: TimeSlot[];
  maxStudents: number;
  teacherName?: string;
}

// Dùng riêng cho form tạo/sửa lớp
export type ClassFormValues = {
  name: string;
  subject: string;
  teacherId: string;
  maxStudents: number;
  timeSlots: TimeSlot[];
};

export type ClassItem = {
  _id?: string;
  id?: string;
  name?: string;
  subject?: string;
  timeSlots?: TimeSlot[];
  maxStudents?: number;
  room?: string;
  teacherId?: string;
};

export type ClassItemLite = Required<Pick<ClassItem, "_id" | "name" | "subject">> &
  Pick<ClassItem, "timeSlots" | "maxStudents" | "room">;

export type TeacherLite = { _id: string; name: string; email?: string };