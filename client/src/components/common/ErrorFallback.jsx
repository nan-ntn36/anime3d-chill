/**
 * ErrorFallback — Hiển thị khi fetch lỗi + nút Thử lại
 */

import './ErrorFallback.css';

export default function ErrorFallback({ message = 'Đã xảy ra lỗi', onRetry }) {
  return (
    <div className="error-fallback">
      <div className="error-fallback__icon">⚠️</div>
      <p className="error-fallback__message">{message}</p>
      {onRetry && (
        <button className="btn btn-primary btn-sm" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
}
