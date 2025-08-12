import { createBrowserRouter, Navigate } from "react-router-dom";
import RequireAuth from "./requiredAuth";
import RequireRole from "./requiredRole";
import NotAuthorized from "../pages/Public/NotFound/NotAuthorized";
import HomePage from "../pages/Public/HomePage/HomePage";
import AuthPage from "../pages/Public/Auth/Auth";
import AdminLayout from "../components/layout/adminLayout";
import DashboardPage from "../pages/Admin/DashboardPage/DashboardPage";
import StudentPage from "../pages/Admin/StudentPage/StudentPage";
import ClassPage from "../pages/Admin/ClassPage/ClassPage";
import SubjectPage from "../pages/Admin/SubjectPage/SubjectPage";
import TeachingSchedulePage from "../pages/Admin/TeachingSchedulePage/TeachingSchedulePage";

// Profile layout + pages
import ProfileLayout from "../pages/Public/ProfileLayout/ProfileLayout";
import ProfilePage from "../pages/Public/ProfilePage/ProfilePage";
import ChangePasswordPage from "../pages/Public/ChangePasswordPage/ChangePasswordPage";

// ======= NEW: Student pages =======
import StudentRegistrationPage from "../pages/Student/StudentRegistrationPage/StudentRegistrationPage";
import StudentSchedulePage from "../pages/Student/StudentSchedulePage/StudentSchedulePage";
import EnrolledClassesPage from "../pages/Student/EnrolledClassesPage/EnrolledClassPage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/login-register", element: <AuthPage /> },

  {
    path: "/profile",
    element: (
      <RequireAuth>
        <ProfileLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <ProfilePage /> },
      { path: "change-password", element: <ChangePasswordPage /> },
    ],
  },

  { path: "/403", element: <NotAuthorized /> },

  // ======= Student area (protected by role) =======
  {
    path: "/student/registration",
    element: (
      <RequireRole allowed={["student"]} redirectTo="/403">
        <StudentRegistrationPage />
      </RequireRole>
    ),
  },
  {
    path: "/student/schedule",
    element: (
      <RequireRole allowed={["student"]} redirectTo="/403">
        <StudentSchedulePage />
      </RequireRole>
    ),
  },
  {
  path: "/student/enrolled", // ✅ route mới
  element: (
    <RequireRole allowed={["student"]} redirectTo="/403">
      <EnrolledClassesPage />
    </RequireRole>
  ),
},

  // ======= Admin area (as-is) =======
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
