import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '@store/authStore';
import useAuth from '@hooks/useAuth';

const LoginPage = lazy(() => import('@pages/LoginPage'));
const Dashboard = lazy(() => import('@pages/Dashboard'));
const UserManagement = lazy(() => import('@pages/UserManagement'));

function PageLoader() {
  return (
    <div className="page-loading">
      <div className="spinner" />
    </div>
  );
}

/**
 * ProtectedRoute — chỉ cho phép admin đã đăng nhập
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/login" replace />;

  return children;
}

/**
 * Admin App Router
 */
export default function App() {
  const { isCheckingAuth } = useAuth();
  const isLoading = useAuthStore((s) => s.isLoading);

  const hasSession = typeof window !== 'undefined' && localStorage.getItem('adminSession') === '1';
  if (!hasSession && isLoading) {
    useAuthStore.getState().setLoaded();
  }

  if (isCheckingAuth && isLoading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
