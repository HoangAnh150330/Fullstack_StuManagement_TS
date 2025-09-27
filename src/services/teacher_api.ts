import axios, {
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
} from "axios";
import { store } from "../redux/store";
import type { RootState } from "../redux/store";
import { absolutize } from "../utils/url";

// ==== Types import từ /types ====
import type { GradeType, GradeRecord, AddGradeItem } from "../types/grade";
import type { ClassItem } from "../types/class";
import type { StudentLite } from "../types/common";
import type { AttendanceRecord } from "../types/attendance";
import type { MaterialItem } from "../types/material";
import type { Announcement } from "../types/announcement";
import type { TeacherLite } from "../types/common";

/* ========= axios instance ========= */
const BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");
const API_BASE = BASE.endsWith("/api") ? BASE : `${BASE}/api`;

const teacher_api = axios.create({ baseURL: API_BASE });

teacher_api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const state = store.getState() as RootState;
  const token = state.auth.user?.token || localStorage.getItem("token") || undefined;

  if (token) {
    cfg.headers = AxiosHeaders.from(cfg.headers || {});
    (cfg.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }
  return cfg;
});

/* ========= Helpers ========= */
function extractArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const d = (payload as { data?: unknown })?.data;
  return Array.isArray(d) ? (d as T[]) : [];
}

function extractObject<T extends object>(payload: unknown): T | null {
  const d = (payload as { data?: unknown })?.data ?? payload;
  return d && typeof d === "object" ? (d as T) : null;
}

/* ========= API ========= */

// (Admin) danh sách giáo viên
export async function teacherList(config?: AxiosRequestConfig) {
  const r = await teacher_api.get<unknown>("/admin/teachers", config);
  return extractArray<TeacherLite>(r.data);
}

/* ===== Lớp học ===== */
export async function teacherGetMyClasses(config?: AxiosRequestConfig) {
  const r = await teacher_api.get<unknown>("/teacher/classes", config);
  return extractArray<ClassItem>(r.data);
}

export async function teacherGetClassStudents(classId: string, config?: AxiosRequestConfig) {
  const r = await teacher_api.get<unknown>(`/teacher/classes/${classId}/students`, config);
  return extractArray<StudentLite>(r.data);
}

/* ===== Điểm danh ===== */
export async function teacherMarkAttendance(payload: {
  classId: string;
  date: string; // ISO yyyy-mm-dd
  records: AttendanceRecord[];
}) {
  const r = await teacher_api.post<unknown>("/teacher/attendance", payload);
  return extractObject<{ message?: string }>(r.data);
}

export async function teacherUpdateAttendance(
  attendanceId: string,
  patch: { status?: "present" | "absent" | "late"; note?: string }
) {
  const r = await teacher_api.put<unknown>(`/teacher/attendance/${attendanceId}`, patch);
  return extractObject<{ message?: string }>(r.data);
}

export async function teacherGetAttendanceByDate(classId: string, isoDate: string) {
  const r = await teacher_api.get<unknown>("/teacher/attendance", { params: { classId, date: isoDate } });
  const d = (r.data as { data?: unknown })?.data;
  return Array.isArray(d)
    ? (d as AttendanceRecord[])
    : [];
}

/* ===== Điểm số ===== */
export async function teacherGetGradesByType(classId: string, type: GradeType) {
  const r = await teacher_api.get<unknown>("/teacher/grades", { params: { classId, type } });
  const d = (r.data as { data?: unknown })?.data ?? r.data;
  return Array.isArray(d) ? (d as GradeRecord[]) : [];
}

export async function teacherAddGrades(payload: { classId: string; type: GradeType; items: AddGradeItem[] }) {
  const r = await teacher_api.post<unknown>("/teacher/grades", payload);
  return extractObject<{ message?: string }>(r.data);
}

export async function teacherUpdateGrade(gradeId: string, patch: { score?: number; note?: string }) {
  const r = await teacher_api.put<unknown>(`/teacher/grades/${gradeId}`, patch);
  return extractObject<{ message?: string }>(r.data);
}

/* ===== Tài liệu ===== */
export async function teacherGetMaterials(classId: string) {
  const r = await teacher_api.get<unknown>(`/teacher/materials/${classId}`);
  return extractArray<MaterialItem>(r.data);
}

export async function teacherUploadMaterialMeta(payload: {
  classId: string;
  name: string;
  url: string;
  size?: string | number;
}) {
  const r = await teacher_api.post<unknown>("/teacher/materials", payload);
  return extractObject<MaterialItem>(r.data);
}

export async function teacherUpdateMaterial(materialId: string, patch: { name?: string }) {
  const r = await teacher_api.put<unknown>(`/teacher/materials/${materialId}`, patch);
  return extractObject<{ message?: string }>(r.data);
}

export async function teacherDeleteMaterial(materialId: string) {
  const r = await teacher_api.delete<unknown>(`/teacher/materials/${materialId}`);
  return extractObject<{ message?: string }>(r.data);
}

// Upload file raw (multipart)
type UploadPayload = { url?: string; path?: string; location?: string; size?: number; name?: string };
type UploadResponseShape = UploadPayload | { data?: UploadPayload };

export async function teacherUploadRawFile(file: File) {
  const form = new FormData();
  form.append("file", file);

  const r = await teacher_api.post<unknown>("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const raw = r.data as UploadResponseShape;
  const data: UploadPayload =
    (raw && typeof raw === "object" && "data" in raw && raw.data) ? (raw.data as UploadPayload) : (raw as UploadPayload);

  const url = absolutize(data.url || data.path || data.location || "");
  return { url, size: data.size, name: data.name };
}

/* ===== Thông báo & lịch dạy ===== */
export async function teacherSendAnnouncement(payload: { classId: string; title: string }) {
  const r = await teacher_api.post<unknown>("/teacher/announcements", payload);
  return extractObject<{ message?: string }>(r.data);
}

export async function teacherGetAnnouncements(classId: string) {
  const r = await teacher_api.get<unknown>(`/teacher/announcements/${classId}`);
  return extractArray<Announcement>(r.data);
}

// Lịch dạy của GV hiện tại
export async function teacherGetMySchedule() {
  const r = await teacher_api.get<unknown>("/teacher/schedule/me");
  return extractArray<ClassItem>(r.data);
}

export async function teacherUpdateSchedule(classId: string, patch: { schedule?: string }) {
  const r = await teacher_api.put<unknown>(`/teacher/schedule/${classId}`, patch);
  return extractObject<{ message?: string }>(r.data);
}

export default teacher_api;
