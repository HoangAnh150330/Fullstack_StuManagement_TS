import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer, type View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./TeachingSchedulePage.css";
import { getSchedulesAPI } from "../../services/schedule_api";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  day?: string;
  slot?: string;
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

const TeachingSchedulePage: React.FC = () => {
  const [view, setView] = useState<"week" | "month">("week");
  const [date, setDate] = useState(new Date("2025-08-07T23:36:00+07:00"));
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const handleViewChange = (newView: View) => {
    if (newView === "week" || newView === "month") {
      setView(newView);
    }
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const fetchEvents = async () => {
    try {
      const data = await getSchedulesAPI();
      console.log("Dữ liệu từ API:", data);

      const dayMap: { [key: string]: number } = {
        "Chủ nhật": 0,
        "Thứ 2": 1,
        "Thứ 3": 2,
        "Thứ 4": 3,
        "Thứ 5": 4,
        "Thứ 6": 5,
        "Thứ 7": 6,
      };

      const parsedEvents: CalendarEvent[] = [];

      data.forEach((classItem: ScheduleItem) => {
        const { className, teacher, subject, timeSlots } = classItem;

        timeSlots.forEach((slot: TimeSlot) => {
          const { day, slot: slotTime, start, end } = slot;
          if (!day || !slotTime || !start || !end) return;

          const [startHourStr, endHourStr] = slotTime.split("-");
          const [startHour, startMinute] = startHourStr.split(":").map(Number);
          const [endHour, endMinute] = endHourStr.split(":").map(Number);

          const startDate = moment(start);
          const endDate = moment(end);
          const dayOfWeek = dayMap[day];

          if (dayOfWeek === undefined) return;

          let current = startDate.clone().day(dayOfWeek);
          if (current.isBefore(startDate)) current.add(7, 'days');

          while (current.isSameOrBefore(endDate)) {
            const startEvent = current.clone().hour(startHour).minute(startMinute).toDate();
            const endEvent = current.clone().hour(endHour).minute(endMinute).toDate();

            parsedEvents.push({
              title: `${subject} - ${className} - GV: ${teacher}`,
              start: startEvent,
              end: endEvent,
              day: day,
              slot: slotTime,
            });

            current.add(7, 'days');
          }
        });
      });

      setEvents(parsedEvents);
    } catch (error) {
      console.error("Lỗi khi fetch lịch giảng dạy", error);
    }
  };


  useEffect(() => {
    fetchEvents();
  }, [date]);

  return (
    <div className="teaching-schedule-wrapper">
      <h2 className="schedule-title">Lịch giảng dạy</h2>
      <Calendar<CalendarEvent>
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={view}
         views={["week", "month"]}
        step={30}
        timeslots={2}
        date={date}
        onView={handleViewChange}
        onNavigate={handleNavigate}
        style={{ height: 600 }}
        min={new Date(2025, 7, 1, 7, 0)}
        max={new Date(2025, 7, 1, 21, 0)}
      />
    </div>
  );
};

export default TeachingSchedulePage;