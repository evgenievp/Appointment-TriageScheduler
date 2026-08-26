// Пренесен от Claude Design (components/forms/Radio.jsx).
// Истинският `input` е скрит и рисуваме кръгчето сами — както при `Checkbox`.
// Фокус пръстенът е през `.sirma-choice` в ds/app.css, иначе полето е невидимо
// при Tab.
//
// Оригиналът е с 20px/10px/12px/15px/13px/2px; сведени са до скалата и до
// съществуващите `--control-size` / `--control-dot-size`.

export default function Radio({
  label,
  description,
  checked,
  onChange,
  disabled,
  name,
  value,
  style,
  ...rest
}) {
  return (
    <label
      className="sirma-choice"
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
        className="sirma-choice__mark"
        style={{
          width: 'var(--control-size)',
          height: 'var(--control-size)',
          flex: '0 0 var(--control-size)',
          borderRadius: 'var(--radius-circle)',
          border:
            'var(--border-width) solid ' +
            (checked ? 'var(--blue-400)' : 'var(--border-strong)'),
          background: 'var(--white)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color var(--dur) var(--ease)',
        }}
      >
        {checked && (
          <span
            style={{
              width: 'var(--control-dot-size)',
              height: 'var(--control-dot-size)',
              borderRadius: 'var(--radius-circle)',
              background: 'var(--blue-400)',
            }}
          />
        )}
      </span>
      <input
        type="radio"
        name={name}
        value={value}
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
