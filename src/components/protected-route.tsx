import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth.context"; // đổi đường dẫn cho đúng

// Chỉ cho vào nếu đã đăng nhập
export function PrivateRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// Chỉ cho vào nếu là admin
export function AdminRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />; // chữ hoa
  return <Outlet />;
}

// Chỉ cho vào nếu CHƯA đăng nhập
export function GuestRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
