import React from "react";
import { Layout, Avatar, Space, Typography, Dropdown, type MenuProps } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/auth-slice";

const { Header } = Layout;
const { Text } = Typography;

const HeaderBar: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "profile") {
      navigate("/profile");
    } else if (key === "logout") {
      dispatch(logout());
      navigate("/");
    }
  };

  const items: MenuProps["items"] = [
    { label: "Thông tin cá nhân", key: "profile" },
    { type: "divider" },
    { label: "Đăng xuất", key: "logout" },
  ];

  return (
    <Header className="bg-gray-100 px-6 flex justify-end items-center h-16 shadow-md">
      <Space size="middle" className="items-center">
        <div className="flex flex-col text-right">
          {/* slice bạn không có name -> dùng email */}
          <Text strong className="text-base">{user?.email ?? "User"}</Text>
          <Text type="secondary" className="text-xs">{user?.role ?? "No role"}</Text>
        </div>

        <Dropdown menu={{ items, onClick }} placement="bottomRight" trigger={["click"]}>
          <Avatar
            icon={<UserOutlined />}
            size="large"
            className="bg-blue-500 cursor-pointer shadow"
          />
        </Dropdown>
      </Space>
    </Header>
  );
};

export default HeaderBar;
