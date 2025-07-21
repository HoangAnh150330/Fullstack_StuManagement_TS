import { useEffect, useState } from 'react';
import { Button, Input, Table, Space, Modal, message,Col, Row } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { studentAPI } from '../../services/student_api';
import StudentForm from '../../components/student/studentForm';
import type { StudentData } from '../../types/student';
import './studentPage.css'
const StudentPage = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getAll();
      setStudents(res);
    } catch (error) {
      message.error('Không thể tải danh sách học viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Bạn chắc chắn muốn xóa học viên này?',
      onOk: async () => {
        await studentAPI.delete(id);
        message.success('Đã xóa học viên');
        fetchStudents();
      },
    });
  };

  const columns = [
    { title: 'Họ tên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: StudentData) => (
        <Space>
          <Button onClick={() => { setSelectedStudent(record); setIsModalOpen(true); }}>Sửa</Button>
          <Button danger onClick={() => handleDelete(record.id)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="student-page-wrapper">
      <div className="student-header">
        <h1 className="student-title">🎓 Quản lý học viên</h1>
        <Row justify="space-between" align="middle" style={{ marginTop: 16, marginBottom: 24 }}>
          <Col>
            <Input.Search
              placeholder="Tìm kiếm học viên"
              onSearch={(value) => setSearch(value)}
              allowClear
              style={{ width: 300 }}
            />
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedStudent(null);
                setIsModalOpen(true);
              }}
            >
              Thêm học viên
            </Button>
          </Col>
        </Row>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={students}
        bordered
        pagination={{ pageSize: 10 }}
      />

      {isModalOpen && (
        <StudentForm
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          student={selectedStudent}
          onSuccess={fetchStudents}
        />
      )}
    </div>
  );
};

export default StudentPage;