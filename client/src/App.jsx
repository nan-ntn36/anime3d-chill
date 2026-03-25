import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@components/layout/AppLayout';

/**
 * Lazy load pages — code splitting
 */
const Home = lazy(() => import('@pages/Home'));
const Login = lazy(() => import('@pages/Login'));
const MovieDetail = lazy(() => import('@pages/MovieDetail'));
const MoviePlayerPage = lazy(() => import('@pages/MoviePlayerPage'));
const NotFound = lazy(() => import('@pages/NotFound'));

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
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="/phim-moi" element={<Home />} />
          <Route path="/the-loai" element={<Home />} />
          <Route path="/quoc-gia" element={<Home />} />
          <Route path="/tim-kiem" element={<Home />} />
          <Route path="/phim/:slug" element={<MovieDetail />} />
          <Route path="/phim/:slug/xem" element={<MoviePlayerPage />} />
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

