import { useState } from 'react';
import Icon from './Icon';

// Пренесен от Claude Design (components/forms/Select.jsx) — полето е същото като
// на `Input`, само с chevron вместо suffix. Списъкът се рисува от браузъра, но
// текстът в него е наш, затова езикът му не зависи от езика на браузъра.
// При следващ ре-sync да се свери с оригинала — пренесен е по `Input`, а не от
// бъндъла, защото двата компонента споделят цялата кутия.

export default function Select({ label, hint, error, mono, children, style, ...rest }) {
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
        <select
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            appearance: 'none',
            border: 0,
            outline: 0,
            background: 'transparent',
            width: '100%',
            font: 'inherit',
            fontFamily: mono ? 'var(--font-mono)' : 'inherit',
            color: 'var(--navy-900)',
            cursor: 'pointer',
            ...style,
          }}
          {...rest}
        >
          {children}
        </select>
        <Icon name="chevron-down" size="var(--icon-sm)" />
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
