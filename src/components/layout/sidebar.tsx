import { Layout, Menu, ConfigProvider, theme } from "antd";
import {
  UserOutlined,
  BookOutlined,
  AppstoreOutlined,
  HomeFilled,
  ScheduleOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider theme="dark">
      {/* Logo */}
      <div className="h-16 m-4 flex items-center justify-center gap-2 text-blue-500 font-bold text-xl bg-white rounded-lg shadow">
        <HomeFilled className="text-2xl" />
        ErisAdmin
      </div>

      {/* Menu with custom selected/hover via tokens */}
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          components: {
            Menu: {
              itemSelectedBg: "#1890ff",
              itemSelectedColor: "#ffffff",
              itemHoverBg: "#40a9ff",
              itemHoverColor: "#ffffff",
            },
          },
        }}
      >
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key as string)}
          items={[
            { key: "dashboard", icon: <AppstoreOutlined />, label: "Tổng quan" },
            { key: "students", icon: <UserOutlined />, label: "Quản lý học viên" },
            { key: "classes", icon: <BookOutlined />, label: "Quản lý lớp học" },
            { key: "subjects", icon: <BookOutlined />, label: "Quản lý môn học" },
            { key: "teaching-schedule", icon: <ScheduleOutlined />, label: "Lịch giảng dạy" },
          ]}
        />
      </ConfigProvider>
    </Sider>
  );
};

export default Sidebar;
