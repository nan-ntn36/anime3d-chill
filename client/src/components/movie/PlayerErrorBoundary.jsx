import { Component } from 'react';

/**
 * PlayerErrorBoundary — Error boundary riêng cho Video Player (Day 10-11)
 * Catch lỗi render trong player mà không crash toàn bộ app
 */
class PlayerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PlayerErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="player-error-boundary">
          <h3>😵 Trình phát gặp sự cố</h3>
          <p>Không thể khởi tạo video player. Vui lòng thử tải lại.</p>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              background: 'var(--color-bg-tertiary)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              maxWidth: '500px',
              overflow: 'auto',
              textAlign: 'left',
            }}>
              {this.state.error.toString()}
            </pre>
          )}
          <button className="btn btn-primary" onClick={this.handleReset}>
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PlayerErrorBoundary;
