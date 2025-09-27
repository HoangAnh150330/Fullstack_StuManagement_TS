import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer, type View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getSchedulesAPI } from "../../../services/schedule_api";
import type { ScheduleEvent, ScheduleItemDTO } from "../../../types/schedule";

const localizer = momentLocalizer(moment);

const dayMap: Record<string, number> = {
  "Chủ nhật": 0,
  "Thứ 2": 1,
  "Thứ 3": 2,
  "Thứ 4": 3,
  "Thứ 5": 4,
  "Thứ 6": 5,
  "Thứ 7": 6,
};

const pickTeacherName = (c: ScheduleItemDTO) =>
  c.teacherName ?? c.teacher ?? c.teacherId?.name ?? "Không xác định";

const pickClassName = (c: ScheduleItemDTO) =>
  c.className ?? c.name ?? (c as { class?: string }).class ?? "Lớp";

const pickSubject = (c: ScheduleItemDTO) =>
  c.subject ?? c.subjectName ?? "Môn học";

function hhmmToParts(hhmm: string): { h: number; m: number } {
  const [h, m] = hhmm.split(":").map((v) => Number(v || 0));
  return { h, m };
}

const TeachingSchedulePage: React.FC = () => {
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSchedulesAPI();
        const parsed: ScheduleEvent[] = [];

        data.forEach((c) => {
          const base: Omit<ScheduleEvent, "startTime" | "endTime"> = {
            subjectName: pickSubject(c),
            className: pickClassName(c),
            teacherName: pickTeacherName(c),
          };

          (c.timeSlots ?? []).forEach(({ day, slot, start, end }) => {
            if (!day || !slot) return;
            const dow = dayMap[day];
            if (dow === undefined) return;

            const [sHH, eHH] = slot.split("-");
            const { h: sh, m: sm } = hhmmToParts(sHH);
            const { h: eh, m: em } = hhmmToParts(eHH);

            // Nếu có start/end ISO từ BE → tính theo khoảng ngày
            if (start && end) {
              const startDate = moment(start).startOf("day");
              const endDate = moment(end).endOf("day");
              let current = startDate.clone().day(dow);
              if (current.isBefore(startDate)) current = current.add(7, "days");

              while (current.isSameOrBefore(endDate, "day")) {
                parsed.push({
                  ...base,
                  startTime: current
                    .clone()
                    .hour(sh)
                    .minute(sm)
                    .second(0)
                    .toISOString(),
                  endTime: current
                    .clone()
                    .hour(eh)
                    .minute(em)
                    .second(0)
                    .toISOString(),
                });
                current = current.add(7, "days");
              }
              return;
            }

            // Nếu chỉ có slot → lấy tuần hiện tại
            const baseDate = moment(date).startOf("week").day(dow);
            parsed.push({
              ...base,
              startTime: baseDate
                .clone()
                .hour(sh)
                .minute(sm)
                .second(0)
                .toISOString(),
              endTime: baseDate
                .clone()
                .hour(eh)
                .minute(em)
                .second(0)
                .toISOString(),
            });
          });
        });

        setEvents(parsed);
      } catch (e) {
        console.error("Fetch schedules failed:", e);
        setEvents([]);
      }
    })();
  }, [date]);

  // Chuyển đổi ScheduleEvent → event cho react-big-calendar
  const calendarEvents = events.map((ev) => ({
    title: `${ev.subjectName} - ${ev.className} - GV: ${ev.teacherName}`,
    start: new Date(ev.startTime),
    end: new Date(ev.endTime),
  }));

  return (
    <div className="p-5 bg-slate-50">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 m-0">Lịch giảng dạy</h2>
      </div>
      <div className="h-[650px] bg-white rounded-md shadow">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
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
            className:
              "bg-blue-600 text-white border-0 px-1.5 py-0.5 rounded",
          })}
        />
      </div>
    </div>
  );
};

export default TeachingSchedulePage;
