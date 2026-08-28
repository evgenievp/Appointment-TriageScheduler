// Пренесен от Claude Design (components/scheduling/PriorityQueueRow.jsx).
// Чипът, score-ът и часът са в mono; цветът стои зад чипа, не в текста.
//
// Оригиналът е с 16px/14px/15px/13px/12px/11px и 2px отстъп; сведени са до
// скалата, затова не съвпадат едно към едно с бъндъла.
//
// Системата има три нива (P1/P2/P3), бекендът има две — NORMAL и URGENT.
// `soon` стои тук за пълнота, но нищо не го подава, докато няма трето ниво.
//
// Добавено спрямо оригинала: при `onClick` редът става достижим с клавиатура
// (role/tabIndex/Enter/Space), а действията отдясно спират разпространението —
// иначе клик по „Откажете“ щеше да задейства и самия ред. И `phone` — целият
// смисъл на опашката е да се обадиш, а номерът го нямаше никъде.

const priorities = {
  urgent: { background: 'var(--danger)', label: 'P1' },
  soon: { background: 'var(--warning)', label: 'P2' },
  routine: { background: 'var(--success)', label: 'P3' },
};

export default function PriorityQueueRow({
  priority = 'routine',
  score,
  scoreLabel,
  patient,
  phone,
  reason,
  waiting,
  actions,
  selected,
  onClick,
  style,
  ...rest
}) {
  const chip = priorities[priority] ?? priorities.routine;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick &&
        ((event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick(event);
          }
        })
      }
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-4) var(--space-4)',
        borderRadius: 'var(--radius)',
        cursor: onClick ? 'pointer' : 'default',
        background: selected ? 'var(--surface-selected)' : 'var(--white)',
        border:
          'var(--border-width) solid ' +
          (selected ? 'var(--blue-400)' : 'var(--border-default)'),
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 'var(--fw-bold)',
          fontSize: 'var(--text-caption)',
          color: 'var(--navy-900)',
          background: chip.background,
          borderRadius: 'var(--radius)',
          padding: 'var(--space-1) var(--space-2)',
          minWidth: 'var(--priority-chip-width)',
          textAlign: 'center',
        }}
      >
        {chip.label}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 'var(--text-body-md)',
              fontWeight: 'var(--fw-semibold)',
              color: 'var(--navy-900)',
            }}
          >
            {patient}
          </span>
          {phone && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 'var(--fw-mono)',
                fontSize: 'var(--text-body-sm)',
                color: 'var(--text-strong-muted)',
              }}
            >
              {phone}
            </span>
          )}
        </div>
        {reason && (
          <div
            style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--text-muted)',
              marginTop: 'var(--space-1)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {reason}
          </div>
        )}
      </div>

      {score != null && (
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 'var(--text-micro)',
              color: 'var(--text-subtle)',
              letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase',
            }}
          >
            {scoreLabel}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 'var(--fw-bold)',
              fontSize: 'var(--text-body-md)',
              color: 'var(--navy-900)',
            }}
          >
            {score}
          </div>
        </div>
      )}

      {waiting && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 'var(--fw-mono)',
            fontSize: 'var(--text-body-sm)',
            color: 'var(--text-muted)',
            minWidth: 'var(--priority-time-width)',
            textAlign: 'right',
          }}
        >
          {waiting}
        </div>
      )}

      {actions && (
        <div
          onClick={(event) => event.stopPropagation()}
          style={{ display: 'flex', gap: 'var(--space-2)' }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
