import { useState } from 'react';

// Пренесен от Claude Design (components/core/IconButton.jsx).
// Кръгъл бутон само с икона — едно от малкото места в системата, където кръгът
// е позволен. `label` е задължителен, защото няма видим текст.
// `size` е CSS дължина, за да може да е токън: --icon-btn-size / --icon-btn-size-sm.

const tones = {
  primary: {
    background: 'var(--action-bg)',
    color: 'var(--action-text)',
    border: 'var(--border-width) solid transparent',
  },
  secondary: {
    background: 'var(--white)',
    color: 'var(--navy-500)',
    border: 'var(--border-width) solid var(--border-default)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--navy-500)',
    border: 'var(--border-width) solid transparent',
  },
  dark: {
    background: 'var(--navy-500)',
    color: 'var(--text-on-dark)',
    border: 'var(--border-width) solid transparent',
  },
};

const hovers = {
  primary: { background: 'var(--action-bg-hover)' },
  secondary: { background: 'var(--neutral-50)' },
  ghost: { background: 'var(--neutral-50)' },
  dark: { background: 'var(--navy-900)' },
};

export default function IconButton({
  variant = 'secondary',
  size = 'var(--icon-btn-size)',
  label,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      aria-label={label}
      title={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: size,
        height: size,
        flex: `0 0 ${size}`,
        borderRadius: 'var(--radius-circle)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        boxShadow: 'var(--shadow-none)',
        transition: 'background var(--dur) var(--ease)',
        ...tones[variant],
        ...(hover ? hovers[variant] : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
