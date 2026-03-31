import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import useAuth from '@/hooks/useAuth';
import './Login.css';

export default function Login() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isLoggingIn, isRegistering } = useAuth();

  const fromPrefix = location.state?.from?.pathname || '/';

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setErrorMsg('');
    reset();
  };

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      if (isLoginView) {
        await login({ email: data.email, password: data.password });
        navigate(fromPrefix, { replace: true });
      } else {
        await register({ username: data.username, email: data.email, password: data.password });
        // Mặc định đăng ký xong thì báo thành công và chuyển sang form login
        setErrorMsg('Đăng ký thành công! Đang chuyển sang Đăng nhập...');
        setTimeout(() => setIsLoginView(true), 1500);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{isLoginView ? 'Đăng nhập' : 'Đăng ký'} — Anime3D-Chill</title>
        <meta name="description" content={isLoginView ? 'Đăng nhập vào Anime3D-Chill để xem phim yêu thích.' : 'Tạo tài khoản Anime3D-Chill miễn phí.'} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${window.location.origin}/dang-nhap`} />
      </Helmet>

      <div className="auth-page">
        <div className="auth-container">
          <h2 className="auth-title">{isLoginView ? 'Đăng Nhập' : 'Tạo Tài Khoản'}</h2>
          
          {errorMsg && (
            <div className={`auth-alert ${errorMsg.includes('công') ? 'auth-alert--success' : 'auth-alert--error'}`}>
              {errorMsg}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
            {!isLoginView && (
              <div className="auth-group">
                <label>Tên đăng nhập / Nickname</label>
                <input
                  type="text"
                  placeholder="Ví dụ: otaku_vn"
                  {...registerForm('username', { required: 'Vui lòng nhập tên tài khoản', minLength: { value: 3, message: 'Ít nhất 3 ký tự' } })}
                  className={errors.username ? 'input-error' : ''}
                />
                {errors.username && <span className="error-text">{errors.username.message}</span>}
              </div>
            )}

            <div className="auth-group">
              <label>Địa chỉ Email</label>
              <input
                type="email"
                placeholder="Ví dụ: mail@example.com"
                {...registerForm('email', { 
                  required: 'Vui lòng nhập Email',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' }
                })}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email.message}</span>}
            </div>

            <div className="auth-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                {...registerForm('password', { required: 'Vui lòng nhập mật khẩu', minLength: { value: 6, message: 'Mật khẩu phải từ 6 ký tự' } })}
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary auth-submit"
              disabled={isLoggingIn || isRegistering}
            >
              {(isLoggingIn || isRegistering) ? <span className="spinner-micro"></span> : (isLoginView ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ')}
            </button>
          </form>

          <div className="auth-footer">
            {isLoginView ? (
              <p>Trở thành thành viên? <button type="button" onClick={toggleView} className="auth-link-btn">Đăng ký ngay</button></p>
            ) : (
              <p>Đã có tài khoản? <button type="button" onClick={toggleView} className="auth-link-btn">Quay lại Đăng nhập</button></p>
            )}
            <p style={{ marginTop: '10px' }}><Link to="/" className="auth-link-btn" style={{ color: 'var(--color-text-muted)' }}>Về trang chủ</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}
