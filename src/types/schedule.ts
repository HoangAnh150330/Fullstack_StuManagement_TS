import type { TimeSlot } from "./class";

// DTO cho time slot khi giao tiếp BE (chi tiết hơn TimeSlot)
export interface TimeSlotDTO {
  day: string;
  slot: string;
  start?: string;
  end?: string;
}

export interface ScheduleItem {
  classId: string; // Bắt buộc để đảm bảo rowKey và cancelEnrollAPI
  className: string;
  subject: string;
  teacher: string;
  timeSlots: TimeSlotDTO[]; // Đồng bộ với TimeSlotDTO
}

export interface ScheduleItemDTO {
  _id?: string; // Tùy chọn, phụ thuộc BE
  className?: string;
  subject?: string;
  teacher?: string;
  timeSlots: TimeSlotDTO[];
  name?: string;
  class?: string;
  subjectName?: string;
  teacherName?: string;
  teacherId?: { _id?: string; name?: string; email?: string };
}
export interface ScheduleEvent {
  subjectName: string;
  className: string;
  teacherName: string;
  startTime: string;
  endTime: string;
}
