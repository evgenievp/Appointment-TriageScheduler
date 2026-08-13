// Пренесен от Claude Design (components/feedback/Skeleton.jsx).
// Пулсът е в ds/app.css (клас `sirma-skeleton-block`), не се инжектира от JS.
//
// Размерите на блокчетата НЕ са токени, когато просто повтарят големината на
// елемента, който заместват (реда от AppointmentRow, badge-а, бутона). Това не са
// нови дизайнерски решения, а огледало на съществуващи — токен би им дал живот,
// какъвто нямат. Където има смислен токен (височина на клетка, размер на плочка,
// височина на текстов ред), се ползва той.

const range = (n) => Array.from({ length: n }, (_, i) => i);

function Block({ w = '100%', h = 'var(--text-caption)', r = 'var(--radius)', delay = 0, style }) {
  return (
    <span
      className="sirma-skeleton-block"
      style={{
        display: 'block',
        width: w,
        height: h,
        borderRadius: r,
        animationDelay: delay + 'ms',
        flex: '0 0 auto',
        ...style,
      }}
    />
  );
}

function SlotGridSkeleton({ days, rows }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${days},1fr)`,
        gap: 'var(--space-2)',
      }}
    >
      {range(days).map((i) => (
        <div
          key={i}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
        >
          <Block h="var(--slot-day-header-height)" />
          {range(rows).map((j) => (
            <Block key={j} h="var(--slot-cell-height)" delay={(i + j) * 60} />
          ))}
        </div>
      ))}
    </div>
  );
}

function DoctorGridSkeleton({ count, columns }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns},1fr)`,
        gap: 'var(--space-4)',
      }}
    >
      {range(count).map((i) => (
        <div
          key={i}
          style={{
            background: 'var(--white)',
            border: 'var(--border-width) solid var(--border-default)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <Block w="var(--tile-size)" h="var(--tile-size)" />
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
          >
            <Block w="62%" h="var(--text-h4)" delay={i * 60} />
            <Block w="40%" h="var(--text-body-sm)" delay={i * 60 + 60} />
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
          >
            <Block delay={i * 60 + 120} />
            <Block w="78%" delay={i * 60 + 180} />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              paddingTop: 'var(--space-1)',
            }}
          >
            <Block w="var(--dot-size)" h="var(--dot-size)" r="var(--radius-circle)" />
            <Block w={120} h="var(--text-body-sm)" delay={i * 60 + 240} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AppointmentListSkeleton({ count }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {range(count).map((i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-5)',
            padding: 'var(--space-4) var(--space-5)',
            border: 'var(--border-width) solid var(--border-default)',
            borderRadius: 'var(--radius)',
            background: 'var(--white)',
          }}
        >
          <Block w="var(--date-col-width)" h={50} />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <Block w="38%" h="var(--text-body-md)" delay={i * 80} />
            <Block w="56%" h="var(--text-body-sm)" delay={i * 80 + 60} />
          </div>
          <Block w={96} h={26} delay={i * 80 + 120} />
          <Block w={104} h={36} delay={i * 80 + 180} />
        </div>
      ))}
    </div>
  );
}

export default function Skeleton({
  variant = 'block',
  days = 5,
  rows = 5,
  count = 6,
  columns = 3,
  width = '100%',
  height = 'var(--text-caption)',
  radius = 'var(--radius)',
  label, // подай преведен текст: t('common.loading')
  style,
  ...rest
}) {
  let body;
  if (variant === 'slot-grid') body = <SlotGridSkeleton days={days} rows={rows} />;
  else if (variant === 'doctor-grid')
    body = <DoctorGridSkeleton count={count} columns={columns} />;
  else if (variant === 'appointment-list')
    body = <AppointmentListSkeleton count={count} />;
  else if (variant === 'text')
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {range(rows).map((i) => (
          <Block key={i} w={i === rows - 1 ? '64%' : '100%'} h={height} delay={i * 60} />
        ))}
      </div>
    );
  else body = <Block w={width} h={height} r={radius} />;

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      style={{ width: '100%', ...style }}
      {...rest}
    >
      <div aria-hidden="true">{body}</div>
    </div>
  );
}
