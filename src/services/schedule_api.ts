import axios from "axios";

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
const API_BASE = BASE.endsWith("/api") ? BASE : `${BASE}/api/schedule`;
const api = axios.create({ baseURL: API_BASE });

type UnknownPayload = { data?: unknown } | unknown;

function ensureArray<T>(payload: UnknownPayload): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const d = (payload as { data?: unknown })?.data;
  return Array.isArray(d) ? (d as T[]) : [];
}

export interface TimeSlotDTO {
  day: string;
  slot: string;     // "HH:mm-HH:mm"
  start?: string;   // ISO optional
  end?: string;     // ISO optional
}

export interface ScheduleItemDTO {
  className?: string;
  name?: string;
  class?: string;
  subject?: string;
  subjectName?: string;
  teacher?: string;
  teacherName?: string;
  teacherId?: { _id?: string; name?: string; email?: string };
  timeSlots: TimeSlotDTO[];
}

export async function getSchedulesAPI(): Promise<ScheduleItemDTO[]> {
  const r = await api.get("/teaching-schedule"); // đổi path nếu BE khác
  return ensureArray<ScheduleItemDTO>(r.data);
}
