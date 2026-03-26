import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * ProtectedRoute Component
 * Đảm bảo chỉ User đã đăng nhập mới được truy cập các routes con
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Lưu lại vị trí để redirect sau khi login
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
