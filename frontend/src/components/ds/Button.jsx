import { useState } from 'react';

// Пренесен от Claude Design (components/core/Button.jsx).
// Бутоните са action-син фон с NAVY текст — никога бял.
// Всички стойности идват от токени; голи числа тук не се пишат.

const base = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 'var(--fw-semibold)',
  fontSize: 'var(--text-body-md)',
  letterSpacing: 'var(--ls-control)',
  borderRadius: 'var(--radius)',
  border: 'var(--border-width) solid transparent',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-2)',
  transition:
    'background var(--dur) var(--ease), color var(--dur) var(--ease), border-color var(--dur) var(--ease)',
  textDecoration: 'none',
  boxShadow: 'var(--shadow-none)',
  lineHeight: 'var(--lh-control)',
  whiteSpace: 'nowrap',
};

const sizes = {
  sm: { padding: 'var(--btn-padding-sm)', fontSize: 'var(--text-body-sm)' },
  md: { padding: 'var(--btn-padding)' },
  lg: { padding: 'var(--btn-padding-lg)', fontSize: 'var(--text-body-lg)' },
};

const variants = {
  primary: { background: 'var(--action-bg)', color: 'var(--action-text)' },
  secondary: {
    background: 'var(--white)',
    color: 'var(--navy-500)',
    borderColor: 'var(--border-default)',
  },
  ghost: { background: 'transparent', color: 'var(--navy-500)' },
  dark: { background: 'var(--navy-500)', color: 'var(--text-on-dark)' },
  danger: { background: 'var(--danger)', color: 'var(--navy-900)' },
};

const hovers = {
  primary: { background: 'var(--action-bg-hover)' },
  secondary: { background: 'var(--neutral-50)', borderColor: 'var(--border-strong)' },
  ghost: { background: 'var(--neutral-50)' },
  dark: { background: 'var(--navy-900)' },
  danger: { background: 'var(--danger-hover)' },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  fullWidth,
  iconLeft,
  iconRight,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const s = {
    ...base,
    ...sizes[size],
    ...variants[variant],
    ...(hover && !disabled ? hovers[variant] : null),
    ...(fullWidth ? { width: '100%' } : null),
    ...(disabled ? { opacity: 'var(--opacity-disabled)', cursor: 'not-allowed' } : null),
    ...style,
  };
  return (
    <button
      style={s}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
