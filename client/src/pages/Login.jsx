import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

/**
 * Login — Trang đăng nhập (placeholder cho Day 8+)
 */
export default function Login() {
  return (
    <>
      <Helmet>
        <title>Đăng Nhập — Anime3D-Chill</title>
      </Helmet>

      <section className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - var(--header-height) - 200px)',
        padding: 'var(--space-8) var(--space-4)',
      }}>
        <div className="card" style={{ padding: 'var(--space-8)', maxWidth: '420px', width: '100%' }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            Đăng Nhập
          </h1>

          <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Email
              </label>
              <input type="email" className="input" placeholder="email@example.com" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Mật khẩu
              </label>
              <input type="password" className="input" placeholder="••••••••" />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Đăng Nhập
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Chưa có tài khoản? <Link to="/dang-ky">Đăng ký</Link>
          </p>
        </div>
      </section>
    </>
  );
}
