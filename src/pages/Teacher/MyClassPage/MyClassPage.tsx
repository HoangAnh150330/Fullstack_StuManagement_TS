import { useEffect, useState } from "react";
import { Card, Table, Button, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import { teacherGetMyClasses } from "../../../services/teacher_api";

type TimeSlot = { day: string; slot: string };
type ClassItem = {
  _id: string;
  name?: string;
  subject?: string;
  timeSlots?: TimeSlot[];
  maxStudents?: number;
  // room?: string; // nếu muốn hiển thị thêm
};

type ClassRow = {
  _id: string;
  name: string;
  subject: string;
  students: number;
  schedule: string;
};

function formatSchedule(timeSlots?: TimeSlot[]) {
  if (!timeSlots || timeSlots.length === 0) return "-";
  return timeSlots.map((s) => `${s.day} ${s.slot}`).join("; ");
}

export default function MyClassesPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ClassRow[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        // BE trả về mảng thuần ClassItem[]
        const data = (await teacherGetMyClasses()) as ClassItem[];

        const mapped: ClassRow[] = data.map((c) => ({
          _id: String(c._id),
          name: c.name ?? "Không xác định",
          subject: c.subject ?? "-",
          // Hiện tại BE chưa trả count học viên => tạm hiển thị maxStudents (hoặc 0)
          students: typeof c.maxStudents === "number" ? c.maxStudents : 0,
          schedule: formatSchedule(c.timeSlots),
        }));

        if (mounted) setRows(mapped);
      } catch (err) {
        console.error("Lỗi tải lớp đang dạy:", err);
        if (mounted) setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card className="rounded-2xl" title="Lớp đang dạy">
      <Table<ClassRow>
        loading={loading}
        dataSource={rows}
        rowKey="_id"
        locale={{ emptyText: <Empty description="Chưa có lớp nào" /> }}
        columns={[
          { title: "Lớp", dataIndex: "name" },
          { title: "Môn", dataIndex: "subject" },
          { title: "Sĩ số (tối đa)", dataIndex: "students", width: 140 },
          { title: "Lịch học", dataIndex: "schedule" },
          {
            title: "Thao tác",
            width: 260,
            render: (_, r) => (
              <>
                <Button type="link" onClick={() => nav(`/teacher/classes/${r._id}`)}>
                  Chi tiết
                </Button>
                <Button type="link" onClick={() => nav(`/teacher/attendance?classId=${r._id}`)}>
                  Điểm danh
                </Button>
                <Button type="link" onClick={() => nav(`/teacher/grades?classId=${r._id}`)}>
                  Nhập điểm
                </Button>
              </>
            ),
          },
        ]}
      />
    </Card>
  );
}
