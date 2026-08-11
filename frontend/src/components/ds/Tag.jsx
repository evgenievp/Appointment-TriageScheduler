// Пренесен от Claude Design (components/core/Tag.jsx).

export default function Tag({ selected, onRemove, children, style, ...rest }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        borderRadius: 'var(--radius)',
        fontSize: 'var(--text-body-sm)',
        fontWeight: 'var(--fw-medium)',
        lineHeight: 'var(--lh-control)',
        background: selected ? 'var(--surface-selected)' : 'var(--neutral-50)',
        border:
          'var(--border-width) solid ' +
          (selected ? 'var(--blue-400)' : 'var(--border-default)'),
        color: 'var(--navy-500)',
        ...style,
      }}
      {...rest}
    >
      {children}
      {onRemove && (
        <span
          onClick={onRemove}
          style={{
            cursor: 'pointer',
            color: 'var(--neutral-400)',
            fontSize: 'var(--text-body-md)',
            lineHeight: 'var(--lh-control)',
          }}
        >
          ×
        </span>
      )}
    </span>
  );
}
