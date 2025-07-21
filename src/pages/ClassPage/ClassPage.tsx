import React, { useState } from "react";
import { Button, Input, Table, Space } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { classData } from "../../types/class";

const initialClasses: classData[] = [];

const ClassManagementPage: React.FC = () => {
  const [data, setData] = useState<classData[]>(initialClasses);
  const [search, setSearch] = useState("");

  const columns = [
    { title: "Tên lớp", dataIndex: "name", key: "name" },
    { title: "Khóa học", dataIndex: "course", key: "course" },
    { title: "Giáo viên", dataIndex: "teacher", key: "teacher" },
    {
      title: "Hành động",
      key: "action",
      render: () => (
        <Space>
          <a>Sửa</a>
          <a>Xóa</a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>🎓 Quản lý lớp học</h2>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm lớp học"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm lớp học
        </Button>
      </Space>
      <Table
        dataSource={data.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        )}
        columns={columns}
        rowKey="id"
      />
    </div>
  );
};

export default ClassManagementPage;