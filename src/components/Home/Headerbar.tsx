import React from "react";
import { Avatar, Dropdown, Menu, message } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { clearAuth } from "../../redux/auth-slice";
import "./HeaderBar.css";

const HeaderBar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const isLoggedIn = !!token;

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "profile") {
      navigate("/profile");
    } else if (key === "logout") {
      dispatch(clearAuth()); 
      message.success("Đăng xuất thành công");
      navigate("/login-register");
    }
  };

  const handleAvatarClick = () => {
    if (!isLoggedIn) {
      message.warning("Bạn cần đăng nhập hoặc đăng ký trước.");
      navigate("/login-register");
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="header-bar">
      <div className="logo">Trung Tâm Eris</div>
      {isLoggedIn ? (
        <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
          <Avatar
            size="large"
            icon={<UserOutlined />}
            style={{ cursor: "pointer" }}
          />
        </Dropdown>
      ) : (
        <Avatar
          size="large"
          icon={<UserOutlined />}
          style={{ cursor: "pointer" }}
          onClick={handleAvatarClick}
        />
      )}
    </div>
  );
};

export default HeaderBar;
