import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../components/layout/adminLayout";
import DashboardPage from "../pages/DashboardPage/DashboardPage";
import StudentPage from "../pages/StudentPage/StudentPage";
import ClassPage from "../pages/ClassPage/ClassPage";
import SubjectPage from "../pages/SubjectPage/SubjectPage";
import AuthPage from "../pages/Auth/Auth"; 
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import HomePage from "../pages/HomePage/HomePage";
import TeachingSchedulePage from "../pages/TeachingSchedulePage/TeachingSchedulePage";

export const router = createBrowserRouter([
  {
    path:"/",
    element:<HomePage/>
  },
  {
    path: "/login-register",
    element: <AuthPage />, 
  },
  {
    path: "/profile",
    element: <ProfilePage />, 
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "students", element: <StudentPage /> },
      { path: "classes", element: <ClassPage /> },
      { path: "subjects", element: <SubjectPage /> },
       { path: "teaching-schedule", element: <TeachingSchedulePage /> },
    ],
  },
]);
