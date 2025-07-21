import { Layout, Menu } from "antd";
import {
  UserOutlined,
  BookOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider theme="dark">
      <div className="demo-logo" style={{ height: 64, background: "white", margin: 16 }} />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={[
          { key: "/dashboard", icon: <AppstoreOutlined />, label: "Tổng quan" },
          { key: "/students", icon: <UserOutlined />, label: "Quản lý học viên" },
          { key: "/classes", icon: <BookOutlined />, label: "Quản lý lớp học" },
          { key: "/subjects", icon: <BookOutlined />, label: "Quản lý môn học" },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;