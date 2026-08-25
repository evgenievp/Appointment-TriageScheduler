import { useState } from 'react';

// Пренесен от Claude Design (components/forms/Input.jsx).
// `mono` е за полета с числа — ЕГН, телефон, номер на книжка.
// `error` оцветява рамката и заема мястото на `hint`, за да не подскача формата.

export default function Input({
  label,
  hint,
  error,
  prefix,
  suffix,
  mono,
  style,
  ...rest
}) {
  const [focus, setFocus] = useState(false);

  return (
    <label style={{ display: 'block', width: '100%' }}>
      {label && (
        <span
          style={{
            display: 'block',
            fontSize: 'var(--text-body-sm)',
            fontWeight: 'var(--fw-semibold)',
            color: 'var(--navy-500)',
            marginBottom: 'var(--space-2)',
          }}
        >
          {label}
        </span>
      )}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          background: 'var(--white)',
          border:
            'var(--border-width) solid ' +
            (error
              ? 'var(--danger)'
              : focus
                ? 'var(--blue-400)'
                : 'var(--border-default)'),
          borderRadius: 'var(--radius)',
          padding: 'var(--field-padding)',
          boxShadow: focus ? 'var(--focus-ring)' : 'var(--shadow-none)',
          transition: 'border-color var(--dur) var(--ease)',
        }}
      >
        {prefix}
        <input
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            border: 0,
            outline: 0,
            background: 'transparent',
            width: '100%',
            font: 'inherit',
            fontFamily: mono ? 'var(--font-mono)' : 'inherit',
            color: 'var(--navy-900)',
            ...style,
          }}
          {...rest}
        />
        {suffix}
      </span>
      {(hint || error) && (
        <span
          style={{
            display: 'block',
            fontSize: 'var(--text-caption)',
            marginTop: 'var(--space-2)',
            color: error ? 'var(--danger)' : 'var(--text-muted)',
          }}
        >
          {error || hint}
        </span>
      )}
    </label>
  );
}
