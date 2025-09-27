export type AttendanceStatus = "present" | "absent" | "late";

export type AttendanceRecord = {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
};
