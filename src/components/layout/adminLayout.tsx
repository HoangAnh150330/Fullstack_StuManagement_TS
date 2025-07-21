import { Layout } from "antd";
import Sidebar from "./sidebar";
import HeaderBar from "./header";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

const AdminLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout style={{ width: "100%" }}> 
        <HeaderBar />
        <Content style={{
          margin: "16px",
          padding: "24px",
          background: "#fff",
          minHeight: "calc(100vh - 64px - 32px)", 
          width: "100%", 
          boxSizing: "border-box"
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
