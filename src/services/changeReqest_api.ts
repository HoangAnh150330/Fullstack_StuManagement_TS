import teacher_api from "./teacher_api";

export type Slot = { day: string; slot: string };
export type ChangeReq = {
  _id: string;
  classId: string;
  oldSlots: Slot[];
  newSlots: Slot[];
  reason?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: string;
};

export async function createChangeRequest(classId: string, newSlots: Slot[], reason?: string) {
  const r = await teacher_api.post("/teacher/change-requests", { classId, newSlots, reason });
  return (r.data as { data: ChangeReq }).data;
}

export async function listMyChangeRequests() {
  const r = await teacher_api.get("/teacher/change-requests");
  const d = (r.data as { data: ChangeReq[] }).data;
  return Array.isArray(d) ? d : [];
}
