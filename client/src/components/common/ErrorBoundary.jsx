import { Component } from 'react';

/**
 * ErrorBoundary — Class component bắt lỗi render
 * Wrap toàn bộ app để hiển thị fallback UI khi crash
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>😵 Oops!</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', maxWidth: '500px' }}>
            Đã xảy ra lỗi không mong muốn. Vui lòng thử tải lại trang.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{
              background: 'var(--color-bg-secondary)',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              maxWidth: '600px',
              overflow: 'auto',
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}>
              {this.state.error.toString()}
            </pre>
          )}
          <button className="btn btn-primary" onClick={this.handleReset}>
            🔄 Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
