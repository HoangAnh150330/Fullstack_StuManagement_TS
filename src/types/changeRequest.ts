export type Slot = {
  day: string;
  slot: string;
};

export type ChangeReqStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface ChangeReq {
  _id: string;
  classId: string;
  oldSlots: Slot[];
  newSlots: Slot[];
  reason?: string;
  status: ChangeReqStatus;
  createdAt: string;
}
