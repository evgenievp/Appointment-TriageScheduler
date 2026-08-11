import { useState } from 'react';

// Пренесен от Claude Design (components/core/Card.jsx).
// Без сенки — дълбочината идва от контраста между фоновете + 1px рамка.
// Изключение: tone="glass" носи единствената позволена сянка в системата.

const tones = {
  plain: {
    background: 'var(--surface-card)',
    border: 'var(--border-width) solid var(--border-default)',
    color: 'var(--text-body)',
  },
  sunken: {
    background: 'var(--surface-sunken)',
    border: 'var(--border-width) solid transparent',
    color: 'var(--text-body)',
  },
  dark: {
    background: 'var(--surface-dark)',
    border: 'var(--border-width) solid transparent',
    color: 'var(--text-on-dark)',
  },
  glass: {
    background: 'var(--glass-panel-bg)',
    border: 'var(--glass-panel-border)',
    backdropFilter: 'var(--glass-panel-blur)',
    WebkitBackdropFilter: 'var(--glass-panel-blur)',
    boxShadow: 'var(--shadow-glass)',
    color: 'var(--text-body)',
  },
};

export default function Card({
  tone = 'plain',
  selected,
  interactive,
  padding,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 'var(--radius)',
        padding: padding || 'var(--card-padding)',
        boxShadow: 'var(--shadow-none)',
        transition:
          'background var(--dur) var(--ease), border-color var(--dur) var(--ease)',
        ...tones[tone],
        ...(interactive ? { cursor: 'pointer' } : null),
        ...(interactive && hover && !selected
          ? { borderColor: 'var(--border-strong)', background: 'var(--surface-sunken)' }
          : null),
        ...(selected
          ? { borderColor: 'var(--blue-400)', background: 'var(--surface-selected)' }
          : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
