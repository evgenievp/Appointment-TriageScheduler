// Пренесен от Claude Design (components/feedback/Toast.jsx).
// Тъмна плочка с цветна точка за тона. Компонентът само се рисува —
// показването и скриването се управляват от `ToastHost`.

const toastAccent = {
  info: 'var(--info)',
  success: 'var(--success)',
  danger: 'var(--danger)',
  warning: 'var(--warning)',
};

export default function Toast({ tone = 'info', title, message, onClose, style, ...rest }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-3)',
        alignItems: 'flex-start',
        background: 'var(--navy-900)',
        color: 'var(--text-on-dark)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-4)',
        minWidth: 'var(--toast-min-width)',
        maxWidth: 'var(--toast-max-width)',
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          width: 'var(--space-2)',
          height: 'var(--space-2)',
          borderRadius: 'var(--radius-circle)',
          background: toastAccent[tone],
          marginTop: 'var(--space-2)',
          flex: '0 0 var(--space-2)',
        }}
      />
      <div style={{ flex: 1 }}>
        {title && (
          <div
            style={{ fontWeight: 'var(--fw-semibold)', fontSize: 'var(--text-body-sm)' }}
          >
            {title}
          </div>
        )}
        {message && (
          <div
            style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--text-on-dark-muted)',
              marginTop: 'var(--space-1)',
            }}
          >
            {message}
          </div>
        )}
      </div>
      {onClose && (
        <span
          onClick={onClose}
          style={{
            cursor: 'pointer',
            color: 'var(--text-on-dark-nav)',
            fontSize: 'var(--text-body-lg)',
            lineHeight: 'var(--lh-control)',
          }}
        >
          ×
        </span>
      )}
    </div>
  );
}
