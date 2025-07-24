import { Layout, Menu } from "antd";
import {
  UserOutlined,
  BookOutlined,
  AppstoreOutlined,
  HomeFilled,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import'./sidebar.css';
const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider theme="dark">
      <div
        style={{
          height: 64,
          margin: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: "#1890ff",
          fontWeight: "bold",
          fontSize: 20,
          background: "white",
          borderRadius: 8,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
  <HomeFilled style={{ fontSize: 24 }} />
  ErisAdmin
</div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={[
          { key: "dashboard", icon: <AppstoreOutlined />, label: "Tổng quan" },
          { key: "students", icon: <UserOutlined />, label: "Quản lý học viên" },
          { key: "classes", icon: <BookOutlined />, label: "Quản lý lớp học" },
          { key: "subjects", icon: <BookOutlined />, label: "Quản lý môn học" },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;