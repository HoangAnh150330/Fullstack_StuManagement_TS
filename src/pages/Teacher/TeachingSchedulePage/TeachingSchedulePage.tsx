// src/pages/Teacher/TeachingSchedulePage/TeachingSchedulePage.tsx
import { useEffect, useMemo, useState } from "react";
import { Card } from "antd";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
  type Components,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import { teacherGetMySchedule } from "../../../services/teacher_api";
const localizer = momentLocalizer(moment);

/* ===== Types an toàn ===== */
type SlotLike = {
  day?: number | string; // "Thứ 2"/"Chủ nhật" hoặc 0..6
  dow?: number;          // alias
  dayOfWeek?: number;    // alias (1..7 ở BE cũ: 7 = CN)
  start?: string;        // "07:00" hoặc ISO
  startTime?: string;    // alias
  end?: string;          // "09:00" hoặc ISO
  endTime?: string;      // alias
  slot?: string;         // "07:00-09:00"
};

type ClassWithSlots = {
  _id?: string;
  id?: string;
  name?: string;
  className?: string;
  classname?: string;
  subject?: string;
  room?: string;
  teacherId?: string;
  timeSlots?: SlotLike[];
};

// Sự kiện đưa vào react-big-calendar (không cần id)
type RBEvent = {
  start: Date;
  end: Date;
  title: string;
  resource?: { classId: string; teacherId?: string };
};

/* ===== Helpers ===== */

// Chuẩn hoá DOW về 0..6 (0 = CN) cho mọi kiểu input
function normalizeDOW(v?: number | string): number {
  if (typeof v === "number" && Number.isFinite(v)) {
    // - FE/BE mới: 0..6 (giữ nguyên)
    if (v >= 0 && v <= 6) return v;
    // - BE cũ: 1..7 (7 = CN)
    if (v === 7) return 0;
    if (v >= 1 && v <= 6) return v; // 1=Mon .. 6=Sat
  }

  const s = (v ?? "").toString().trim().toLowerCase();
  if (!s) return 1; // default: Thứ 2

  if (s.includes("chủ nhật") || s.includes("chu nhat") || s.includes("cn")) return 0;

  // "thứ 2", "thu 3", ...
  const m = s.match(/\d+/);
  if (m) {
    const n = Number(m[0]); // 1..7
    if (n === 7) return 0; // CN
    if (n >= 2 && n <= 7) return n - 1; // Thứ 2 -> 1, ... Thứ 7 -> 6
    if (n === 1) return 0; // lỡ ghi "Thứ 1" coi như CN
  }

  return 1; // fallback Thứ 2
}

function splitSlot(slot?: string): { start?: string; end?: string } {
  if (!slot) return {};
  const [a, b] = slot.split("-").map((x) => x.trim());
  return { start: a, end: b };
}

const ISO_LIKE = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/* ===== Component ===== */
export default function TeachingSchedulePage() {
  const [events, setEvents] = useState<RBEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // chỉ lấy lịch của GV hiện tại (API đã sửa)
        const classes: ClassWithSlots[] = await teacherGetMySchedule();

        const weekStart = dayjs().startOf("week"); // CN = 0
        const evs: RBEvent[] = [];

        (classes ?? []).forEach((c) => {
          const cid = String(c._id ?? c.id ?? "");
          const titleName = c.name ?? c.className ?? c.classname ?? "Lớp";

          (c.timeSlots ?? []).forEach((t) => {
            const dow = normalizeDOW(t.day ?? t.dow ?? t.dayOfWeek);

            const times = splitSlot(t.slot);
            const sRaw = t.start ?? t.startTime ?? times.start ?? "07:00";
            const eRaw = t.end ?? t.endTime ?? times.end ?? "09:00";

            let start: Date;
            let end: Date;

            if (ISO_LIKE.test(String(sRaw)) && ISO_LIKE.test(String(eRaw))) {
              // BE trả ISO → dùng trực tiếp
              start = new Date(String(sRaw));
              end = new Date(String(eRaw));
            } else {
              // Chỉ có HH:mm → ghép theo tuần hiện tại + dow
              const [sh, sm] = String(sRaw).split(":").map((x) => Number(x || 0));
              const [eh, em] = String(eRaw).split(":").map((x) => Number(x || 0));
              const base = weekStart.add(dow, "day"); // ❗ dùng chính weekStart
              start = base.hour(sh).minute(sm).second(0).toDate();
              end = base.hour(eh).minute(em).second(0).toDate();
            }

            evs.push({
              title: `${c.subject ?? ""} - ${titleName}${c.room ? ` • ${c.room}` : ""}`,
              start,
              end,
              resource: { classId: cid, teacherId: c.teacherId },
            });
          });
        });

        setEvents(evs);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Load schedule error:", e);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Có thể custom components nếu muốn
  const components: Components<RBEvent> = useMemo(() => ({}), []);

  return (
    <Card className="rounded-2xl" title="Lịch giảng dạy" loading={loading}>
      <div style={{ height: 650 }}>
        <BigCalendar<RBEvent>
          localizer={localizer}
          events={events}
          defaultView={Views.WEEK}
          views={[Views.WEEK, Views.MONTH]}
          step={30}
          timeslots={2}
          tooltipAccessor={(e) => e.title}
          components={components}
        />
      </div>
    </Card>
  );
}
