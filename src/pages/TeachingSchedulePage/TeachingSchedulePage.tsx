import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer, type View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getSchedulesAPI } from "../../services/schedule_api";
// (optional) dùng AntD cho nút nhanh


const localizer = momentLocalizer(moment);

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  day?: string;
  slot?: string;
}
interface TimeSlot { day: string; slot: string; start?: string; end?: string; }
interface ScheduleItem { className: string; teacher: string; subject: string; timeSlots: TimeSlot[]; }

const TeachingSchedulePage: React.FC = () => {
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const fetchEvents = async () => {
    try {
      const data = await getSchedulesAPI();

      const dayMap: Record<string, number> = {
        "Chủ nhật": 0, "Thứ 2": 1, "Thứ 3": 2, "Thứ 4": 3, "Thứ 5": 4, "Thứ 6": 5, "Thứ 7": 6,
      };

      const parsed: CalendarEvent[] = [];
      data.forEach((c: ScheduleItem) => {
        c.timeSlots.forEach(({ day, slot, start, end }) => {
          if (!day || !slot || !start || !end) return;
          const [h1, h2] = slot.split("-");
          const [sh, sm] = h1.split(":").map(Number);
          const [eh, em] = h2.split(":").map(Number);

          const startDate = moment(start);
          const endDate = moment(end);
          const dow = dayMap[day];
          if (dow === undefined) return;

          const current = startDate.clone().day(dow);
          if (current.isBefore(startDate)) current.add(7, "days");

          while (current.isSameOrBefore(endDate)) {
            const s = current.clone().hour(sh).minute(sm).toDate();
            const e = current.clone().hour(eh).minute(em).toDate();
            parsed.push({ title: `${c.subject} - ${c.className} - GV: ${c.teacher}`, start: s, end: e, day, slot });
            current.add(7, "days");
          }
        });
      });

      setEvents(parsed);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchEvents(); }, [date]);



  return (
    <div className="p-5 bg-slate-50">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 m-0">Lịch giảng dạy</h2>
      </div>

      {/* ✅ Bọc Calendar trong container có chiều cao cố định */}
      <div className="h-[650px] bg-white rounded-md shadow">
        <Calendar<CalendarEvent>
          localizer={localizer}
          events={events}
          view={view}                    // controlled view
          onView={(v) => setView(v)}     // đồng bộ khi người dùng đổi view bằng toolbar mặc định
          date={date}
          onNavigate={(d) => setDate(d)}
          views={["week", "month"]}
          step={30}
          timeslots={2}
          // min/max chỉ dùng để giới hạn KHUNG GIỜ của view tuần/ngày → dùng mốc ngày bất kỳ cho an toàn
          min={new Date(1970, 0, 1, 7, 0)}
          max={new Date(1970, 0, 1, 21, 0)}
          style={{ height: "100%" }}     // Calendar chiếm 100% chiều cao container
          eventPropGetter={() => ({ className: "bg-blue-600 text-white border-0 px-1.5 py-0.5 rounded" })}
        />
      </div>
    </div>
  );
};

export default TeachingSchedulePage;
