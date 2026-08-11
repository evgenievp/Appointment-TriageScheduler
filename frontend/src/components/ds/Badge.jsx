// Пренесен от Claude Design (components/core/Badge.jsx).
// Всички семантични фонове носят navy текст, никога бял.

const badgeTones = {
  neutral: { background: 'var(--neutral-200)', color: 'var(--navy-500)' },
  info: { background: 'var(--info-soft)', color: 'var(--navy-900)' },
  free: { background: 'var(--success)', color: 'var(--navy-900)' },
  urgent: { background: 'var(--danger)', color: 'var(--navy-900)' },
  soon: { background: 'var(--warning-soft)', color: 'var(--navy-900)' },
  flag: { background: 'var(--highlight)', color: 'var(--navy-900)' },
  blue: { background: 'var(--blue-100)', color: 'var(--navy-900)' },
};

export default function Badge({ tone = 'neutral', mono, dot, children, style, ...rest }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-1) var(--space-3)',
        borderRadius: 'var(--radius)',
        fontSize: 'var(--text-caption)',
        fontWeight: mono ? 'var(--fw-mono)' : 'var(--fw-semibold)',
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        letterSpacing: mono ? 'var(--ls-mono)' : 'var(--ls-label)',
        lineHeight: 'var(--lh-label)',
        ...badgeTones[tone],
        ...style,
      }}
      {...rest}
    >
      {dot && (
        <span
          style={{
            width: 'var(--dot-size)',
            height: 'var(--dot-size)',
            borderRadius: 'var(--radius-circle)',
            background: 'currentColor',
            opacity: 'var(--opacity-muted)',
          }}
        />
      )}
      {children}
    </span>
  );
}
