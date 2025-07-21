import React, { useState } from "react";
import { Button, Input, Table, Space } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { SubjectData } from "../../types/subject";

const initialSubjects: SubjectData[] = [];

const SubjectManagementPage: React.FC = () => {
  const [data, setData] = useState<SubjectData[]>(initialSubjects);
  const [search, setSearch] = useState("");

  const columns = [
    { title: "Tên môn học", dataIndex: "name", key: "name" },
    { title: "Mã môn", dataIndex: "code", key: "code" },
    { title: "Số tín chỉ", dataIndex: "credit", key: "credit" },
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
      <h2>📘 Quản lý môn học</h2>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm môn học"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm môn học
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

export default SubjectManagementPage;