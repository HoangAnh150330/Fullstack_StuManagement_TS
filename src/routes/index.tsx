import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/adminLayout";
import DashboardPage from "../pages/DashboardPage/DashboardPage";
import StudentPage from "../pages/StudentPage/StudentPage";
import ClassPage from "../pages/ClassPage/ClassPage";
import SubjectPage from "../pages/SubjectPage/SubjectPage";
import AuthPage from "../pages/Auth/Auth";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import HomePage from "../pages/HomePage/HomePage";
import TeachingSchedulePage from "../pages/TeachingSchedulePage/TeachingSchedulePage";

import RequireAuth from "./requiredAuth";
import RequireRole from "./requiredRole";
import NotAuthorized from "../pages/NotFound/NotAuthorized"; 

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },

  { path: "/login-register", element: <AuthPage /> },

  {
    path: "/profile",
    element: (
      <RequireAuth>
        <ProfilePage />
      </RequireAuth>
    ),
  },

  { path: "/403", element: <NotAuthorized /> },

  {
    path: "/admin",
    element: (
      <RequireRole allowed={["admin"]} redirectTo="/403">
        <AdminLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },

      { path: "dashboard", element: <DashboardPage /> },
      { path: "students", element: <StudentPage /> },
      { path: "classes", element: <ClassPage /> },
      { path: "subjects", element: <SubjectPage /> },
      { path: "teaching-schedule", element: <TeachingSchedulePage /> },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);
