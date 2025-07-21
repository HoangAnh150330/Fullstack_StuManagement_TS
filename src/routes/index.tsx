import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../components/layout/adminLayout";
import DashboardPage from "../pages/DashboardPage/DashboardPage";
import StudentPage from "../pages/StudentPage/StudentPage";
import ClassPage from "../pages/ClassPage/ClassPage";
import SubjectPage from "../pages/SubjectPage/SubjectPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "students", element: <StudentPage /> },
      { path: "classes", element: <ClassPage /> },
      { path: "subjects", element: <SubjectPage /> },
    ],
  },
]);