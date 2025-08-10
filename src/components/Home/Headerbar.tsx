import React from "react";
import { Avatar, Dropdown, message, type MenuProps } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { logout } from "../../redux/auth-slice";

const HeaderBar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const isLoggedIn = !!user;

  const onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "profile") {
      navigate("/profile");
    } else if (key === "logout") {
      dispatch(logout());
      message.success("Đăng xuất thành công");
      navigate("/login-register");
    }
  };

  const items: MenuProps["items"] = [
    { key: "profile", label: "Thông tin cá nhân", icon: <UserOutlined /> },
    { key: "logout", label: "Đăng xuất", icon: <LogoutOutlined /> },
  ];

  const handleAvatarClick = () => {
    if (!isLoggedIn) {
      message.warning("Bạn cần đăng nhập hoặc đăng ký trước.");
      navigate("/login-register");
    }
  };

  return (
    <div className="h-16 bg-slate-800 text-white flex items-center justify-between px-6">
      <div className="text-xl font-bold">Trung Tâm Eris</div>

      {isLoggedIn ? (
        <Dropdown menu={{ items, onClick }} placement="bottomRight" trigger={["click"]}>
          <Avatar
            size="large"
            icon={<UserOutlined />}
            className="cursor-pointer transition hover:opacity-90"
          />
        </Dropdown>
      ) : (
        <Avatar
          size="large"
          icon={<UserOutlined />}
          className="cursor-pointer transition hover:opacity-90"
          onClick={handleAvatarClick}
        />
      )}
    </div>
  );
};

export default HeaderBar;
