import React, { useEffect, useState } from "react";
import { Button, Input, Table, Space, Row, Col, Modal, message } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { SubjectData } from "../../types/subject";
import { subjectAPI } from "../../services/subject_api";
import SubjectForm from "../../components/Subject/SubjectForm"; 
import './subjectPage.css';

const SubjectManagementPage: React.FC = () => {
  const [data, setData] = useState<SubjectData[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);

  // NEW: State cho modal xoá
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchSubjects = async () => {
    try {
      const res = await subjectAPI.getAll();
      setData(res);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error("Không thể tải danh sách môn học");
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // ✅ Mở modal xác nhận xoá
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // ✅ Gọi API xoá
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await subjectAPI.delete(deleteId);
      message.success("Đã xóa môn học");
      fetchSubjects();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
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

  const columns = [
    { title: "Tên môn học", dataIndex: "name", key: "name" },
    { title: "Mã môn", dataIndex: "code", key: "code" },
    { title: "Số tín chỉ", dataIndex: "credit", key: "credit" },
    { title: "Mô tả ngắn", dataIndex: "description", key: "description" },
    { title: "Ngày bắt đầu", dataIndex: "startDate", key: "startDate", render: (date: string | Date | null | undefined) => formatDate(date) },
    { title: "Ngày kết thúc", dataIndex: "endDate", key: "endDate", render: (date: string | Date | null | undefined) => formatDate(date) },
    {
      title: "Hành động",
      key: "action",
      render: (_: unknown, record: SubjectData) => (
        <Space>
          <Button type="link" onClick={() => {
            setSelectedSubject(record);
            setIsModalOpen(true);
          }}>Sửa</Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="subject-page-wrapper">
      <div className="subject-header">
        <h1 className="subject-title">📘 Quản lý môn học</h1>
        <Row justify="space-between" align="middle" style={{ marginTop: 16, marginBottom: 24 }}>
          <Col>
            <Input
              placeholder="Tìm môn học"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 300 }}
            />
          </Col>
          <Col>
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
          </Col>
        </Row>
      </div>

      <Table
        rowKey="_id"
        dataSource={filteredData}
        columns={columns}
        bordered
        pagination={{ pageSize: 10 }}
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
        okType="danger"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xoá môn học này không?</p>
      </Modal>
    </div>
  );
};

export default SubjectManagementPage;