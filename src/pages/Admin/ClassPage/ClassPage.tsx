// src/pages/Admin/ClassPage/ClassPage.tsx  (hoặc index.tsx tùy cấu trúc)
import React, { useEffect, useState } from "react";
import { Button, Input, Table, Space, Modal } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { classData } from "../../../types/class";
import ClassForm from "../../../components/Class/ClassForm";
import { classAPI } from "../../../services/class_api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ---------- Helpers (type-safe, no any) ---------- */
function ensureArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const d = (payload as { data?: unknown })?.data;
  return Array.isArray(d) ? (d as T[]) : [];
}

type MaybeErr = {
  response?: { data?: { message?: string }; status?: number };
  data?: { message?: string };
  message?: unknown;
};
const getErrMsg = (e: unknown, fallback = "Có lỗi xảy ra") => {
  if (typeof e === "string") return e;
  if (e && typeof e === "object") {
    const m = e as MaybeErr;
    return (
      m.response?.data?.message ??
      m.data?.message ??
      (typeof m.message === "string" ? m.message : undefined) ??
      fallback
    );
  }
  return fallback;
};

// Một số BE populate hoặc virtual khác nhau:
type WithTeacherVariants =
  | { teacherName?: string; teacher?: string; teacherId?: { name?: string; email?: string } }
  | { teacherName?: string; teacher?: string; teacherId?: string | undefined };

function teacherNameOf(item: classData & WithTeacherVariants): string {
  if (item.teacherName) return item.teacherName;
  const tid = (item as any).teacherId; // chỉ để đọc thuộc tính, không cast rộng
  if (tid && typeof tid === "object" && "name" in tid && typeof tid.name === "string") {
    return tid.name;
  }
  return (item as any).teacher ?? ""; // field cũ nếu có
}

/* ------------------------------------------------ */

const ClassManagementPage: React.FC = () => {
  const [data, setData] = useState<classData[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<classData | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await classAPI.getAll();
      const arr = ensureArray<classData>(res);     // ⬅️ unwrap về mảng
      setData(arr);
    } catch (e: unknown) {
      toast.error(getErrMsg(e, "Không thể tải danh sách lớp học"));
      setData([]);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await classAPI.delete(deleteId);
      toast.success("Đã xóa lớp học");
      fetchClasses();
    } catch (e: unknown) {
      toast.error(getErrMsg(e, "Xóa thất bại"));
    } finally {
      setDeleteId(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSubmit = async (formData: Omit<classData, "_id">) => {
    try {
      if (selectedClass) {
        await classAPI.update(selectedClass._id, formData);
        toast.success("Cập nhật thành công!");
      } else {
        await classAPI.create(formData);
        toast.success("Thêm lớp học thành công!");
      }
      setIsModalOpen(false);
      setSelectedClass(null);
      fetchClasses();
    } catch (e: unknown) {
      const status = (e as MaybeErr)?.response?.status;
      if (status === 409) {
        toast.error(getErrMsg(e, "Giáo viên bị trùng lịch"));
        return;
      }
      toast.error(getErrMsg(e, "Có lỗi xảy ra khi lưu"));
    }
  };

  const filteredData = data.filter((item) => {
    const teacherName = teacherNameOf(item);
    return (
      (item.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      teacherName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const columns: ColumnsType<classData> = [
    { title: "Tên lớp", dataIndex: "name", key: "name" },
    { title: "Môn học", dataIndex: "subject", key: "subject" },
    {
      title: "Giáo viên",
      key: "teacher",
      render: (_: unknown, r) => teacherNameOf(r as classData & WithTeacherVariants),
    },
    { title: "Sĩ số tối đa", dataIndex: "maxStudents", key: "maxStudents" },
    {
      title: "Lịch học",
      key: "timeSlots",
      render: (_: unknown, record) => (
        <div className="space-y-0.5">
          {(record.timeSlots ?? []).map((ts, idx) => (
            <div key={idx}>
              {ts.day} - {ts.slot}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: unknown, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setSelectedClass(record);
              setIsModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-purple-100 to-sky-100 min-h-screen border border-gray-300 rounded-xl shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2 m-0">
          🎓 Quản lý lớp học
        </h1>

        <div className="mt-4 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Tìm lớp học"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="w-full sm:w-80"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedClass(null);
              setIsModalOpen(true);
            }}
          >
            Thêm lớp học
          </Button>
        </div>
      </div>

      <Table
        rowKey="_id"
        dataSource={filteredData}
        columns={columns}
        bordered
        pagination={{ pageSize: 10 }}
        className="bg-white"
      />

      <ClassForm
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClass(null);
        }}
        onSubmit={handleSubmit}
        classItem={selectedClass}
      />

      <Modal
        title="Xác nhận xoá"
        open={isDeleteModalOpen}
        onOk={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteId(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xoá lớp học này không?</p>
      </Modal>

      <ToastContainer position="top-right" autoClose={2500} newestOnTop />
    </div>
  );
};

export default ClassManagementPage;
