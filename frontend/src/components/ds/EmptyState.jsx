// Пренесен от Claude Design (components/feedback/EmptyState.jsx).
// Празно състояние: казва какво липсва и какво може да се направи по въпроса.

const surfaces = {
  sunken: {
    background: 'var(--surface-sunken)',
    borderColor: 'var(--border-default)',
    tile: 'var(--white)',
    tileBorder: 'var(--border-default)',
    title: 'var(--navy-900)',
    body: 'var(--text-strong-muted)',
    mono: 'var(--text-muted)',
  },
  card: {
    background: 'var(--surface-card)',
    borderColor: 'var(--border-default)',
    tile: 'var(--surface-sunken)',
    tileBorder: 'var(--border-default)',
    title: 'var(--navy-900)',
    body: 'var(--text-strong-muted)',
    mono: 'var(--text-muted)',
  },
  dark: {
    background: 'var(--surface-dark)',
    borderColor: 'transparent',
    tile: 'var(--surface-on-dark-tile)',
    tileBorder: 'transparent',
    title: 'var(--text-on-dark)',
    body: 'var(--text-on-dark-muted)',
    mono: 'var(--text-on-dark-muted)',
  },
};

export default function EmptyState({
  icon,
  title,
  description,
  hint,
  action,
  secondaryAction,
  surface = 'sunken',
  align = 'center',
  compact,
  children,
  style,
  ...rest
}) {
  const s = surfaces[surface] || surfaces.sunken;
  const centered = align === 'center';

  return (
    <div
      style={{
        background: s.background,
        border: 'var(--border-width) solid ' + s.borderColor,
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-none)',
        padding: compact
          ? 'var(--space-8) var(--space-6)'
          : 'var(--space-12) var(--space-8)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        alignItems: centered ? 'center' : 'flex-start',
        textAlign: centered ? 'center' : 'left',
        ...style,
      }}
      {...rest}
    >
      {icon && (
        <span
          style={{
            width: 'var(--tile-size)',
            height: 'var(--tile-size)',
            borderRadius: 'var(--radius)',
            background: s.tile,
            border: 'var(--border-width) solid ' + s.tileBorder,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-1)',
          }}
        >
          {icon}
        </span>
      )}
      {title && (
        <div
          style={{
            fontSize: 'var(--text-h3)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--ls-heading)',
            lineHeight: 'var(--lh-heading)',
            color: s.title,
          }}
        >
          {title}
        </div>
      )}
      {description && (
        <p
          style={{
            fontSize: 'var(--text-body-md)',
            lineHeight: 'var(--lh-body)',
            maxWidth: 'var(--measure-prose)',
            color: s.body,
            textWrap: 'pretty',
          }}
        >
          {description}
        </p>
      )}
      {hint && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 'var(--fw-mono)',
            fontSize: 'var(--text-body-sm)',
            letterSpacing: 'var(--ls-mono)',
            color: s.mono,
          }}
        >
          {hint}
        </div>
      )}
      {children}
      {(action || secondaryAction) && (
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            flexWrap: 'wrap',
            marginTop: 'var(--space-2)',
            justifyContent: centered ? 'center' : 'flex-start',
          }}
        >
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
