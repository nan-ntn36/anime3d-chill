import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@components/layout/AppLayout';

/**
 * Lazy load pages — code splitting
 */
const Home = lazy(() => import('@pages/Home'));
const ThungPhim = lazy(() => import('@pages/ThungPhim'));
const Login = lazy(() => import('@pages/Login'));
const MovieDetail = lazy(() => import('@pages/MovieDetail'));
const MoviePlayerPage = lazy(() => import('@pages/MoviePlayerPage'));
const Profile = lazy(() => import('@pages/Profile'));
const ProtectedRoute = lazy(() => import('@components/ui/ProtectedRoute'));
const NotFound = lazy(() => import('@pages/NotFound'));

import useAuth from '@/hooks/useAuth';
import useAuthStore from '@/store/authStore';

/**
 * Page loading fallback
 */
function PageLoader() {
  return (
    <div className="page-loading">
      <div className="spinner" />
    </div>
  );
}

/**
 * App — Router setup
 */
export default function App() {
  // Thực thi query 'me' một lần trên toàn bộ app để lấy Auth status
  const { isCheckingAuth } = useAuth();
  // Zustand state handle Loading từ isCheckingAuth trong hook useAuth
  const isLoading = useAuthStore(state => state.isLoading);

  // Nếu chưa từng login (query disabled), tắt loading ngay
  const hasSession = typeof window !== 'undefined' && localStorage.getItem('hasSession') === '1';
  if (!hasSession && isLoading) {
    useAuthStore.getState().setLoaded();
  }

  if (isCheckingAuth && isLoading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="/all-phim" element={<Home />} />
          <Route path="/thung-phim" element={<ThungPhim />} />
          <Route path="/phim-moi" element={<Home />} />
          <Route path="/the-loai" element={<Home />} />
          <Route path="/quoc-gia" element={<Home />} />
          <Route path="/tim-kiem" element={<Home />} />
          <Route path="/phim/:slug" element={<MovieDetail />} />
          <Route path="/phim/:slug/xem" element={<MoviePlayerPage />} />
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
             <Route path="/ca-nhan" element={<Profile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

