// src/components/layout/teacherLayout.tsx
import { Layout, Menu } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined, TeamOutlined, CalendarOutlined, FileTextOutlined,
  NotificationOutlined, ReadOutlined, EditOutlined, SwapOutlined,
} from "@ant-design/icons";

const { Sider, Header, Content } = Layout;

export default function TeacherLayout() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const items = [
    { key: "/teacher/dashboard", icon: <HomeOutlined />, label: "Tổng quan" },
    { key: "/teacher/classes", icon: <ReadOutlined />, label: "Lớp đang dạy" },
    { key: "/teacher/attendance", icon: <TeamOutlined />, label: "Điểm danh" },
    { key: "/teacher/grades", icon: <EditOutlined />, label: "Điểm số" },
    { key: "/teacher/materials", icon: <FileTextOutlined />, label: "Tài liệu" },
    { key: "/teacher/announcements", icon: <NotificationOutlined />, label: "Thông báo" },
    { key: "/teacher/schedule", icon: <CalendarOutlined />, label: "Lịch giảng dạy" },
    { key: "/teacher/schedule/change-request", icon: <SwapOutlined />, label: "Đề xuất đổi lịch" },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="dark" width={220}>
        <div className="p-4 text-white text-lg font-semibold">ErisTeacher</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={items}
          onClick={(e) => nav(e.key)}
        />
      </Sider>
      <Layout>
        <Header className="bg-white shadow-sm flex items-center px-6">
          <div className="text-slate-700 font-semibold">Teacher Panel</div>
        </Header>
        <Content className="p-6 bg-slate-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
