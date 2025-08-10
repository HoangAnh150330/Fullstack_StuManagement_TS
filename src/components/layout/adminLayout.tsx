import { Layout } from "antd";
import Sidebar from "./sidebar";
import HeaderBar from "./header";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

const AdminLayout = () => {
  return (
    <Layout className="min-h-screen">
      <Sidebar />
      <Layout className="w-full">
        <HeaderBar />
        <Content
          className="
            m-4 p-6 bg-white w-full
            min-h-[calc(100vh-64px-32px)]
            box-border
          "
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
