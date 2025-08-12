import React, { useEffect, useState } from "react";
import { Button, Input, Table, Space, Modal, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { SubjectData } from "../../../types/subject";
import { subjectAPI } from "../../../services/subject_api";
import SubjectForm from "../../../components/Subject/SubjectForm";

const SubjectManagementPage: React.FC = () => {
  const [data, setData] = useState<SubjectData[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchSubjects = async () => {
    try {
      const res = await subjectAPI.getAll();
      setData(res);
    } catch {
      message.error("Không thể tải danh sách môn học");
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await subjectAPI.delete(deleteId);
      message.success("Đã xóa môn học");
      fetchSubjects();
    } catch {
      message.error("Xóa thất bại");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (formData: Omit<SubjectData, "_id">) => {
    try {
      if (selectedSubject) {
        await subjectAPI.update(selectedSubject._id, formData);
        message.success("Cập nhật thành công!");
      } else {
        await subjectAPI.create(formData);
        message.success("Thêm môn học thành công!");
      }
      setIsModalOpen(false);
      setSelectedSubject(null);
      fetchSubjects();
    } catch {
      message.error("Có lỗi xảy ra khi lưu");
    }
  };

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    return !isNaN(d.getTime()) ? d.toLocaleDateString("vi-VN") : "";
  };

  const columns: ColumnsType<SubjectData> = [
    { title: "Tên môn học", dataIndex: "name", key: "name" },
    { title: "Mã môn", dataIndex: "code", key: "code" },
    { title: "Số tín chỉ", dataIndex: "credit", key: "credit" },
    { title: "Mô tả ngắn", dataIndex: "description", key: "description" },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date?: string | Date | null) => formatDate(date),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date?: string | Date | null) => formatDate(date),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: unknown, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setSelectedSubject(record);
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
    <div className="p-8 bg-gradient-to-br from-pink-100 to-sky-100 min-h-screen border border-gray-300 rounded-xl shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2 m-0">
          📘 Quản lý môn học
        </h1>

        <div className="mt-4 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Tìm môn học"
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
              setSelectedSubject(null);
              setIsModalOpen(true);
            }}
          >
            Thêm môn học
          </Button>
        </div>
      </div>

      <Table<SubjectData>
        rowKey="_id"
        dataSource={filteredData}
        columns={columns}
        bordered
        pagination={{ pageSize: 10 }}
        className="bg-white"
      />

      {/* Modal Form */}
      <SubjectForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        subject={selectedSubject}
      />

      {/* Modal xác nhận xoá */}
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
        <p>Bạn có chắc chắn muốn xoá môn học này không?</p>
      </Modal>
    </div>
  );
};

export default SubjectManagementPage;
