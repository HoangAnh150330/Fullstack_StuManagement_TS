import teacher_api from "./teacher_api";
import type { ChangeReq, Slot } from "../types/changeRequest";

export async function createChangeRequest(
  classId: string,
  newSlots: Slot[],
  reason?: string
): Promise<ChangeReq> {
  const r = await teacher_api.post("/teacher/change-requests", {
    classId,
    newSlots,
    reason,
  });
  return (r.data as { data: ChangeReq }).data;
}

export async function listMyChangeRequests(): Promise<ChangeReq[]> {
  const r = await teacher_api.get("/teacher/change-requests");
  const d = (r.data as { data: ChangeReq[] }).data;
  return Array.isArray(d) ? d : [];
}
