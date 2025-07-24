import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Table,
  Space,
  Row,
  Col,
  Modal,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { classData } from "../../types/class";
import ClassForm from "../../components/Class/ClassForm";
import { classAPI } from "../../services/class_api";
import "./classPage.css";

const ClassManagementPage: React.FC = () => {
  const [data, setData] = useState<classData[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<classData | null>(null);

  // Modal xoá (manual confirm)
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await classAPI.getAll();
      setData(res);
    } catch {
      message.error("Không thể tải danh sách lớp học");
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
      message.success("Đã xóa lớp học");
      fetchClasses();
    } catch {
      message.error("Xóa thất bại");
    } finally {
      setDeleteId(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSubmit = async (formData: Omit<classData, "_id">) => {
    try {
      if (selectedClass) {
        await classAPI.update(selectedClass._id, formData);
        message.success("Cập nhật thành công!");
      } else {
        await classAPI.create(formData);
        message.success("Thêm lớp học thành công!");
      }
      setIsModalOpen(false);
      fetchClasses();
    } catch {
      message.error("Có lỗi xảy ra khi lưu");
    }
  };

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: "Tên lớp", dataIndex: "name", key: "name" },
    { title: "Khóa học", dataIndex: "course", key: "course" },
    { title: "Giáo viên", dataIndex: "teacher", key: "teacher" },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: classData) => (
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
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="class-page-wrapper">
      <div className="class-header">
        <h1 className="class-title">🎓 Quản lý lớp học</h1>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginTop: 16, marginBottom: 24 }}
        >
          <Col>
            <Input
              placeholder="Tìm lớp học"
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
                setSelectedClass(null);
                setIsModalOpen(true);
              }}
            >
              Thêm lớp học
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

      <ClassForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        classData={selectedClass}
      />

      {/* ✅ Modal xác nhận xoá */}
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
        <p>Bạn có chắc chắn muốn xoá lớp học này không?</p>
      </Modal>
    </div>
  );
};

export default ClassManagementPage;
