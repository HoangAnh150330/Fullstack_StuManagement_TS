import { useEffect, useState } from "react";
import { Button, Input, Table, Modal, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { studentAPI } from "../../../services/student_api";
import type { StudentData } from "../../../types/student";

const { confirm } = Modal;

/* ------------ Helpers (type-safe, no any) ------------ */
function ensureArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const d = (payload as { data?: unknown })?.data;
  return Array.isArray(d) ? (d as T[]) : [];
}

type IdLike = { id?: string; _id?: string };
function getId(x: unknown): string {
  const obj = x as IdLike | undefined;
  return (obj?.id ?? obj?._id ?? "") as string;
}

/* Row cho Table: luôn có id */
type Row = StudentData & { id: string };

const StudentPage = () => {
  const [students, setStudents] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getAll();

      // Chuẩn hoá: luôn nhận mảng StudentData
      const arr = ensureArray<StudentData>(res);

      // Map _id/id -> id cho Table
      const rows: Row[] = arr.map((s) => ({
        ...s,
        id: getId(s),
      }));

      setStudents(rows);
    } catch {
      message.error("Không thể tải danh sách học viên");
      setStudents([]); // tránh để object gây lỗi filter/map
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = (id: string) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa học viên này không?",
      icon: <ExclamationCircleOutlined />,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await studentAPI.delete(id);
          message.success("Đã xóa học viên");
          fetchStudents();
        } catch {
          message.error("Xóa thất bại");
        }
      },
    });
  };

  const filteredStudents = students.filter((s) =>
    (s.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnsType<Row> = [
    { title: "Họ tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "SĐT", dataIndex: "phone", key: "phone" },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (val?: string) => (val === "male" ? "Nam" : val === "female" ? "Nữ" : "Khác"),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      key: "dob",
      render: (v?: string) => (v ? new Date(v).toLocaleDateString("vi-VN") : ""),
    },
    { title: "Thành phố", dataIndex: "city", key: "city" },
    {
      title: "Hành động",
      key: "action",
      render: (_: unknown, record) => (
        <Button danger onClick={() => handleDelete(record.id)}>
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-cyan-100 to-emerald-100 min-h-screen border border-gray-600 rounded-xl shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2 m-0">
          🎓 Quản lý học viên
        </h1>

        <div className="mt-4 mb-6">
          <Input.Search
            placeholder="Tìm kiếm học viên"
            onSearch={(value) => setSearch(value)}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="w-full sm:w-80"
          />
        </div>
      </div>

      <Table<Row>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={filteredStudents}
        bordered
        pagination={{ pageSize: 10 }}
        className="bg-white"
      />
    </div>
  );
};

export default StudentPage;
