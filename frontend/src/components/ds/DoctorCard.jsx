import { useState } from 'react';

// Пренесен от Claude Design (components/scheduling/DoctorCard.jsx).

export default function DoctorCard({
  icon,
  name,
  specialty,
  description,
  nextSlot,
  selected,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: selected
          ? 'var(--surface-selected)'
          : hover
            ? 'var(--surface-sunken)'
            : 'var(--white)',
        border:
          'var(--border-width) solid ' +
          (selected ? 'var(--blue-400)' : 'var(--border-default)'),
        borderRadius: 'var(--radius)',
        padding: 'var(--space-5)',
        cursor: 'pointer',
        transition:
          'background var(--dur) var(--ease), border-color var(--dur) var(--ease)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          width: 'var(--tile-size)',
          height: 'var(--tile-size)',
          borderRadius: 'var(--radius)',
          background: selected ? 'var(--white)' : 'var(--neutral-50)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </span>
      <div>
        <div
          style={{
            fontSize: 'var(--text-h4)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--ls-heading)',
            color: 'var(--navy-900)',
          }}
        >
          {name}
        </div>
        {specialty && (
          <div
            style={{
              fontSize: 'var(--text-body-sm)',
              fontWeight: 'var(--fw-medium)',
              color: 'var(--text-muted)',
              marginTop: 'var(--space-1)',
            }}
          >
            {specialty}
          </div>
        )}
      </div>
      {description && (
        <p
          style={{
            fontSize: 'var(--text-body-sm)',
            color: 'var(--text-strong-muted)',
            lineHeight: 'var(--lh-body)',
          }}
        >
          {description}
        </p>
      )}
      {nextSlot && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginTop: 'auto',
            paddingTop: 'var(--space-1)',
          }}
        >
          <span
            style={{
              width: 'var(--dot-size)',
              height: 'var(--dot-size)',
              borderRadius: 'var(--radius-circle)',
              background: 'var(--success)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 'var(--fw-mono)',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--navy-500)',
            }}
          >
            {nextSlot}
          </span>
        </div>
      )}
    </div>
  );
}
