// Пренесен от Claude Design (components/scheduling/AppointmentRow.jsx).
// Датата и часът са винаги в mono — час, изписан с Inter, е бъг.

export default function AppointmentRow({
  date,
  time,
  doctor,
  specialty,
  location,
  status,
  actions,
  style,
  ...rest
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-5)',
        padding: 'var(--space-4) var(--space-5)',
        border: 'var(--border-width) solid var(--border-default)',
        borderRadius: 'var(--radius)',
        background: 'var(--white)',
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          textAlign: 'center',
          minWidth: 'var(--date-col-width)',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius)',
          background: 'var(--surface-sunken)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 'var(--fw-mono)',
            fontSize: 'var(--text-body-sm)',
            color: 'var(--text-muted)',
          }}
        >
          {date}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 'var(--fw-bold)',
            fontSize: 'var(--text-h4)',
            color: 'var(--navy-900)',
          }}
        >
          {time}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--text-body-md)',
            fontWeight: 'var(--fw-semibold)',
            color: 'var(--navy-900)',
          }}
        >
          {doctor}
        </div>
        <div
          style={{
            fontSize: 'var(--text-body-sm)',
            color: 'var(--text-muted)',
            marginTop: 'var(--space-1)',
          }}
        >
          {[specialty, location].filter(Boolean).join(' · ')}
        </div>
      </div>
      {status}
      {actions && <div style={{ display: 'flex', gap: 'var(--space-2)' }}>{actions}</div>}
    </div>
  );
}
