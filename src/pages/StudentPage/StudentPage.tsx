import { useEffect, useState } from 'react';
import { Button, Input, Table, Modal, message, Col, Row } from 'antd';
import {  ExclamationCircleOutlined } from '@ant-design/icons';
import { studentAPI } from '../../services/student_api';
import type { StudentData } from '../../types/student';
import './studentPage.css';

const { confirm } = Modal;

const StudentPage = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

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
  }, []);

const handleDelete = async (id: string) => {
  const token = localStorage.getItem('token'); 
  if (!token) {
    message.error('Không tìm thấy token. Vui lòng đăng nhập lại.');
    return;
  }

  confirm({
    title: 'Bạn có chắc chắn muốn xóa học viên này không?',
    icon: <ExclamationCircleOutlined />,
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    onOk: async () => {
      try {
        await studentAPI.delete(id, token); 
        message.success('Đã xóa học viên');
        fetchStudents();
      } catch (err) {
        message.error('Xóa thất bại');
      }
    },
  });
};

  const filteredStudents = students.filter((student) => {
  const name = student.name || '';
  return name.toLowerCase().includes(search.toLowerCase());
});
  const columns = [
    { title: 'Họ tên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
    { 
      title: 'Giới tính', 
      dataIndex: 'gender', 
      key: 'gender',
      render: (value: string) => value === 'male' ? 'Nam' : value === 'female' ? 'Nữ' : 'Khác',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dob',
      key: 'dob',
      render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
    },
    { title: 'Thành phố', dataIndex: 'city', key: 'city' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: StudentData) => (
        <Button danger onClick={() => handleDelete(record.id)}>Xóa</Button>
      ),
    },
  ];


  return (
    <div className="student-page-wrapper">
      <div className="student-header">
        <h1 className="student-title">🎓 Quản lý học viên</h1>
        <Row justify="start" align="middle" style={{ marginTop: 16, marginBottom: 24 }}>
          <Col>
            <Input.Search
              placeholder="Tìm kiếm học viên"
              onSearch={(value) => setSearch(value)}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 300 }}
            />
          </Col>
        </Row>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={filteredStudents}
        bordered
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default StudentPage;
