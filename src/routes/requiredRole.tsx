import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store"; 

type Role = "admin" | "teacher" | "student";

export default function RequireRole({
  children,
  allowed,
  redirectTo = "/",
}: {
  children: React.ReactNode;
  allowed: Role[];
  redirectTo?: string;
}) {
  const user = useSelector((s: RootState) => s.auth.user); 

  if (!user) return <Navigate to="/login-register" replace />;
  if (!allowed.includes(user.role)) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
}
