import { Layout, Avatar, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Header } = Layout;

const HeaderBar = () => {
  return (
    <Header style={{ background: "#fff", padding: "0 16px", textAlign: "right" }}>
      <Space>
        <span>Võ Trường</span>
        <Avatar icon={<UserOutlined />} />
      </Space>
    </Header>
  );
};

export default HeaderBar;