import { useEffect, useState } from "react";
import Hero from "../../../components/Teacher/Hero";
import SectionLeft from "../../../components/Teacher/SectionLeft";
import SectionRight from "../../../components/Teacher/SectionRight";
import type {
  Announcement,
  ProgressItem,
  StudentMessage,
  UpcomingClass,
} from "../../../types/teacher";

export default function TeacherDashboard() {
  const [loading, setLoading] = useState<boolean>(true);

  // ----- header stats (chưa gắn API nên bỏ setter để tránh no-unused-vars)
  const [teacherName]   = useState<string>("Thầy/Cô");
  const [totalClasses]  = useState<number>(0);
  const [totalStudents] = useState<number>(0);
  const [todaySummary]  = useState<string>("0 buổi dạy • 0 tin nhắn mới");

  // ----- KPI + lists
  const [gradingCount]  = useState<number>(0);
  const [weekSessions]  = useState<number>(0);
  const [newMessages]   = useState<number>(0);

  const [upcoming] = useState<UpcomingClass[] | undefined>(undefined);
  const [messages] = useState<StudentMessage[] | undefined>(undefined);
  const [anns]     = useState<Announcement[] | undefined>(undefined);
  const [progress] = useState<ProgressItem[] | undefined>(undefined);

  // Handlers (placeholder để truyền xuống, sau gắn navigate/API thật)
  const handleAttendance = (id: string) => { /* TODO: navigate(`/attendance/${id}`) */ };
  const handleGrade      = (id: string) => { /* TODO: navigate(`/grades/${id}`) */ };
  const handleReply      = (id: string) => { /* TODO: open chat */ };

  useEffect(() => {
    // TODO: gọi API thật và set state tương ứng
    // Khi gắn API, đổi các dòng trên thành useState với setter rồi cập nhật ở đây.
    setLoading(false);
  }, []);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
      <Hero
        teacherName={teacherName}
        totalClasses={totalClasses}
        totalStudents={totalStudents}
        todaySummary={todaySummary}
        loading={loading}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionLeft
            gradingCount={gradingCount}
            weekSessions={weekSessions}
            newMessages={newMessages}
            upcoming={upcoming}
            messages={messages}
            loading={loading}
            onAttendance={handleAttendance}
            onGrade={handleGrade}
            onReply={handleReply}
          />
        </div>

        <SectionRight
          announcements={anns}
          progress={progress}
          loading={loading}
        />
      </div>
    </div>
  );
}
