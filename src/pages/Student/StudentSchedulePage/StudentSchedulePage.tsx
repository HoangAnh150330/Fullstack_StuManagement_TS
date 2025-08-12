import React, { useEffect, useMemo, useState } from "react";
import { Calendar, momentLocalizer, type View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Spin, Empty } from "antd";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { isAxiosError } from "axios";
import { getMyScheduleAPI } from "../../../services/enrollment_api";
import { useNavigate } from "react-router-dom";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  day?: string;
  slot?: string;
  subject?: string;
  className?: string;
  teacher?: string;
}

interface TimeSlot {
  day: string;
  slot: string;
  start?: string;
  end?: string;
}

interface ScheduleItem {
  className: string;
  teacher: string;
  subject: string;
  timeSlots: TimeSlot[];
}

const dayMap: Record<string, number> = {
  "Chủ nhật": 0, "Thứ 2": 1, "Thứ 3": 2, "Thứ 4": 3, "Thứ 5": 4, "Thứ 6": 5, "Thứ 7": 6,
};

function parseSlot(slot: string) {
  const [a, b] = slot.split("-");
  const [sh, sm] = a.split(":").map(Number);
  const [eh, em] = b.split(":").map(Number);
  return { sh, sm, eh, em };
}

function buildEventsWithRange(
  items: ScheduleItem[],
  rangeStart: moment.Moment,
  rangeEnd: moment.Moment
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  items.forEach((c) => {
    c.timeSlots.forEach(({ day, slot, start, end }) => {
      if (!day || !slot) return;
      const dow = dayMap[day];
      if (dow === undefined) return;

      const { sh, sm, eh, em } = parseSlot(slot);

      const effStart = start ? moment(start).startOf("day") : rangeStart.clone().startOf("day");
      const effEnd   = end   ? moment(end).endOf("day")   : rangeEnd.clone().endOf("day");

      const from = moment.max(rangeStart.clone().startOf("day"), effStart);
      const to   = moment.min(rangeEnd.clone().endOf("day"), effEnd);
      if (from.isAfter(to)) return;

      let current = from.clone().day(dow);
      if (current.isBefore(from)) current = current.add(7, "days");

      while (current.isSameOrBefore(to)) {
        const s = current.clone().hour(sh).minute(sm).second(0).toDate();
        const e = current.clone().hour(eh).minute(em).second(0).toDate();
        events.push({
          title: `${c.subject} - ${c.className} - GV: ${c.teacher}`,
          start: s,
          end: e,
          day,
          slot,
          subject: c.subject,
          className: c.className,
          teacher: c.teacher,
        });
        current.add(7, "days");
      }
    });
  });
  return events;
}

function getErrorMessage(err: unknown, fallback = "Có lỗi xảy ra"): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

const StudentSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);
  const studentId: string | undefined = user?._id;

  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { rangeStart, rangeEnd } = useMemo(() => {
    const m = moment(date);
    return view === "month"
      ? {
          rangeStart: m.clone().startOf("month").startOf("week"),
          rangeEnd: m.clone().endOf("month").endOf("week"),
        }
      : {
          rangeStart: m.clone().startOf("week"),
          rangeEnd: m.clone().endOf("week"),
        };
  }, [date, view]);

  useEffect(() => {
    const run = async () => {
      if (!studentId) return;
      setLoading(true);
      setError(null);
      try {
        const data: ScheduleItem[] = await getMyScheduleAPI(studentId);
        const built = buildEventsWithRange(data, rangeStart, rangeEnd);
        setEvents(built);
      } catch (err) {
        setError(getErrorMessage(err, "Không tải được thời khóa biểu"));
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [studentId, rangeStart, rangeEnd]);

  return (
    <div className="p-5 bg-slate-50 min-h-screen">
      <div className="mb-4 flex items-center justify-start gap-3">
        <button
          onClick={() => navigate("/")}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Trở về
        </button>
        <h2 className="text-2xl font-bold text-slate-800 m-0">
          Thời khóa biểu của tôi
        </h2>
      </div>

      <div className="h-[650px] bg-white rounded-md shadow relative">
        {loading && (
          <div className="absolute inset-0 grid place-items-center bg-white/50 z-10">
            <Spin tip="Đang tải..." />
          </div>
        )}

        {!loading && error && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-600">
              <div className="mb-2 text-red-600 font-medium">Lỗi</div>
              <div className="mb-3">{error}</div>
            </div>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <Empty description="Chưa có lịch trong khoảng này" />
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <Calendar<CalendarEvent>
            localizer={localizer}
            events={events}
            view={view}
            onView={(v) => setView(v)}
            date={date}
            onNavigate={(d) => setDate(d)}
            views={["week", "month"]}
            step={30}
            timeslots={2}
            min={new Date(1970, 0, 1, 7, 0)}
            max={new Date(1970, 0, 1, 21, 0)}
            style={{ height: "100%" }}
            eventPropGetter={() => ({
              className: "bg-blue-600 text-white border-0 px-1.5 py-0.5 rounded",
            })}
          />
        )}
      </div>
    </div>
  );
};

export default StudentSchedulePage;
