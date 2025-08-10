import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store"; 

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useSelector((s: RootState) => s.auth.user); 
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login-register" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
