// src/pages/Teacher/ClassDetailPage/ClassDetailPage.tsx
import { useEffect, useState } from "react";
import { Card, Table, Button, Empty, message } from "antd";
import { useParams } from "react-router-dom";
import { teacherGetClassStudents, type StudentLite } from "../../../services/teacher_api";

type StudentRow = { _id: string; name: string; email: string; attendance?: number; mid?: number; final?: number };

export default function ClassDetailPage() {
  const params = useParams();
  const id = params.id ?? params.classId as string;          // ✅ đúng tên param
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<StudentRow[]>([]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data: StudentLite[] = await teacherGetClassStudents(id);
        if (mounted) setRows(data.map(s => ({
          _id: s._id, name: s.name, email: s.email,
          // nếu sau này có điểm/đi chuyên cần thì map thêm ở đây
        })));
      } catch (e) {
        console.error(e);
        message.error("Không tải được danh sách học viên");
        if (mounted) setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleDownloadCSV = () => {
    if (!rows.length) return;
    const header = "name,email,attendance,mid,final\n";
    const body = rows.map(r =>
      `${r.name ?? ""},${r.email ?? ""},${r.attendance ?? ""},${r.mid ?? ""},${r.final ?? ""}`
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `students_${id}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="rounded-2xl" title={`Học viên trong lớp `}>
      <div className="mb-3">
        <Button onClick={handleDownloadCSV} disabled={!rows.length}>Tải danh sách CSV</Button>
      </div>
      <Table<StudentRow>
        loading={loading}
        rowKey="_id"
        dataSource={rows}
        locale={{ emptyText: <Empty description="No data" /> }}
        columns={[
          { title: "Họ tên", dataIndex: "name" },
          { title: "Email", dataIndex: "email" },
          { title: "Chuyên cần (%)", dataIndex: "attendance", width: 140 },
          { title: "Giữa kỳ", dataIndex: "mid", width: 120 },
          { title: "Cuối kỳ", dataIndex: "final", width: 120 },
        ]}
      />
    </Card>
  );
}
