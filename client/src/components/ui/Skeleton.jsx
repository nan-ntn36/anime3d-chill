/**
 * Skeleton — Loading placeholder
 * Sử dụng CSS class .skeleton từ index.css
 */

export default function Skeleton({ width, height, borderRadius, className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius: borderRadius || 'var(--radius-md)',
        ...style,
      }}
    />
  );
}

/**
 * SkeletonCard — Placeholder cho MovieCard
 */
export function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ aspectRatio: '2/3', width: '100%' }} />
      <div style={{ padding: 'var(--space-3)' }}>
        <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: 'var(--space-2)' }} />
        <div className="skeleton" style={{ height: '12px', width: '50%' }} />
      </div>
    </div>
  );
}
