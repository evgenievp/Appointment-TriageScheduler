// Пренесен от Claude Design (components/forms/Checkbox.jsx).
// Истинският `input` е скрит и рисуваме кутийката сами. Добавен е фокус пръстен
// през `.sirma-checkbox` в ds/app.css — иначе полето е невидимо при Tab.

export default function Checkbox({
  label,
  description,
  checked,
  onChange,
  disabled,
  style,
  ...rest
}) {
  return (
    <label
      className="sirma-checkbox"
      style={{
        display: 'flex',
        gap: 'var(--space-3)',
        alignItems: description ? 'flex-start' : 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 'var(--opacity-disabled)' : 1,
        ...style,
      }}
      {...rest}
    >
      <span
        className="sirma-checkbox__box"
        style={{
          width: 'var(--control-size)',
          height: 'var(--control-size)',
          flex: '0 0 var(--control-size)',
          borderRadius: 'var(--radius)',
          border:
            'var(--border-width) solid ' +
            (checked ? 'var(--blue-400)' : 'var(--border-strong)'),
          background: checked ? 'var(--blue-400)' : 'var(--white)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all var(--dur) var(--ease)',
        }}
      >
        {/* Размерът на отметката е през `style`, а не през `width`/`height` —
            SVG атрибутите не приемат CSS променливи. */}
        {checked && (
          <svg
            viewBox="0 0 12 12"
            aria-hidden="true"
            style={{
              width: 'var(--control-icon-size)',
              height: 'var(--control-icon-size)',
            }}
          >
            <path
              d="M2 6.5L4.8 9.2 10 3.4"
              fill="none"
              stroke="var(--navy-900)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={onChange}
        disabled={disabled}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />
      <span>
        <span style={{ fontSize: 'var(--text-body-md)', color: 'var(--navy-500)' }}>
          {label}
        </span>
        {description && (
          <span
            style={{
              display: 'block',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--text-muted)',
              marginTop: 'var(--space-1)',
            }}
          >
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
