export type UpcomingClass = {
  id: string; subject: string; className: string;
  time: string; room: string; status?: "live"|"soon";
};
export type StudentMessage = {
  id: string; student: string; content: string;
  time: string; className: string;
};
export type Announcement = { id: string; title: string; time: string };
export type ProgressItem = { id: string; label: string; value: number; state?: "ok"|"active"|"error" };
