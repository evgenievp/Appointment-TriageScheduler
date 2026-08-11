// Пренесен от Claude Design (components/navigation/GlassHeader.jsx).
// Единственият sticky елемент в приложението. Glass е позволено само върху
// скролващо се съдържание — никога върху плътно бяло.

export default function GlassHeader({ logo, links = [], right, dark, style, ...rest }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-header)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-8)',
        padding: 'var(--space-4) var(--space-8)',
        borderBottom:
          'var(--border-width) solid ' +
          (dark ? 'var(--border-on-dark-faint)' : 'var(--border-default)'),
        background: dark ? 'var(--glass-dark-bg)' : 'var(--glass-header-bg)',
        backdropFilter: 'var(--glass-header-blur)',
        WebkitBackdropFilter: 'var(--glass-header-blur)',
        color: dark ? 'var(--text-on-dark)' : 'var(--navy-500)',
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          fontWeight: 'var(--fw-bold)',
          fontSize: 'var(--text-h3)',
          letterSpacing: 'var(--ls-heading)',
          color: dark ? 'var(--text-on-dark)' : 'var(--navy-900)',
        }}
      >
        {logo}
      </div>
      <nav
        style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', flex: 1 }}
      >
        {links.map((l) => (
          <span
            key={l.label}
            onClick={l.onClick}
            style={{
              fontSize: 'var(--text-body-sm)',
              fontWeight: l.active ? 'var(--fw-semibold)' : 'var(--fw-medium)',
              cursor: 'pointer',
              color: l.active
                ? dark
                  ? 'var(--blue-400)'
                  : 'var(--navy-900)'
                : dark
                  ? 'var(--text-on-dark-nav)'
                  : 'var(--text-muted)',
            }}
          >
            {l.label}
          </span>
        ))}
      </nav>
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
        {right}
      </div>
    </header>
  );
}
