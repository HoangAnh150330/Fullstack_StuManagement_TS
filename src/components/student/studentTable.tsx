import React from "react";
import { Table, Button, Popconfirm, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { StudentData } from "../../types/student";

interface StudentTableProps {
  students: StudentData[];
  onEdit: (student: StudentData) => void;
  onDelete: (id: string) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onEdit, onDelete }) => {
  const columns: ColumnsType<StudentData> = [
    { title: "Tên học viên", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => {
        const label =
          gender === "male" ? "Nam" :
          gender === "female" ? "Nữ" : "Khác";
        const color =
          gender === "male" ? "blue" :
          gender === "female" ? "pink" : "default";
        return <Tag color={color}>{label}</Tag>;
      },
    },
    { title: "Ngày sinh", dataIndex: "birthDate", key: "birthDate" },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button type="link" onClick={() => onEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa học viên này?"
            onConfirm={() => onDelete(record.id)}
          >
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={students}
      className="mt-4"
      scroll={{ x: true }} 
    />
  );
};

export default StudentTable;
