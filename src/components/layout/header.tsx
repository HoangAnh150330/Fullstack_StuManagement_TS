import { Layout, Avatar, Space, Typography, Dropdown, Menu } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../../redux/auth-slice";

const { Header } = Layout;
const { Text } = Typography;

const HeaderBar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "profile") {
      navigate("/profile");
    } else if (key === "logout") {
      dispatch(clearAuth());
      navigate("/login");
    }
  };

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[
        {
          label: "Thông tin cá nhân",
          key: "profile",
        },
        {
          type: "divider",
        },
        {
          label: "Đăng xuất",
          key: "logout",
        },
      ]}
    />
  );

  return (
    <Header
      style={{
        background: "#f5f5f5",
        padding: "0 24px",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        height: "64px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Space size="middle">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "right",
          }}
        >
          <Text strong style={{ fontSize: 16 }}>
            {user?.name || "User"}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {user?.role || "No role"}
          </Text>
        </div>
        <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
          <Avatar
            icon={<UserOutlined />}
            size="large"
            style={{
              backgroundColor: "#1890ff",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            }}
          />
        </Dropdown>
      </Space>
    </Header>
  );
};

export default HeaderBar;
