// Пренесен от Claude Design (components/scheduling/SlotGrid.jsx).
//
// Едно отклонение от дизайна: там слотът се разпознава по низ „дата + час“,
// защото данните са измислени. Тук всеки слот носи `id` от бекенда и изборът
// е по него — иначе не можем да запишем конкретен слот.
//
// Всички колони споделят една времева ос, за да е 09:00 на един и същи ред във
// всеки ден.
//
// Гридът се скролва настрани при тесен екран (виж `.sirma-slot-grid` в ds/app.css),
// вместо колоните да се смачкат под четимото.
//
// days: [{ key, weekday, label, slots: [{ id, time, state }] }]
// value: id на избрания слот
// onSelect: (slot) => void
// labels: { taken, blocked, past } — четат се от екранния четец и от легендата
// legend: списък от състояния, които да се обяснят под грида

// Пет състояния, а не два цвята сиво. Разликата се носи от рамката и от
// задраскването, не от нов фон — на екрана остават бяло и `--surface-sunken`,
// както иска системата.
//
// `taken` е задраскан, защото някой го е взел; `blocked` е с пунктирана рамка,
// защото изобщо не е бил предлаган — лекарят почива; `past` е избледнял, защото
// не е нито едното, просто е минал; `none` е празна клетка, понеже в този час
// лекарят няма график.
const STATES = {
  free: {
    background: 'var(--white)',
    borderColor: 'var(--border-default)',
    borderStyle: 'solid',
    color: 'var(--navy-900)',
  },
  // Само рамката е синя: часът е зает и не се избира, но е негов и трябва да се
  // намира с един поглед сред останалите заети.
  mine: {
    background: 'var(--white)',
    borderColor: 'var(--blue-400)',
    borderStyle: 'solid',
    color: 'var(--navy-900)',
  },
  taken: {
    background: 'var(--neutral-200)',
    borderColor: 'var(--border-strong)',
    borderStyle: 'solid',
    color: 'var(--text-strong-muted)',
    textDecoration: 'line-through',
  },
  blocked: {
    // Диагоналната щриховка е единственото, което се чете от разстояние, без да
    // въвежда нов цвят: почивният ден трябва да личи през цялата колона.
    background:
      'repeating-linear-gradient(45deg, var(--white), var(--white) var(--hatch-band), var(--neutral-200) var(--hatch-band), var(--neutral-200) var(--hatch-gap))',
    borderColor: 'var(--border-strong)',
    borderStyle: 'dashed',
    color: 'var(--text-muted)',
  },
  past: {
    background: 'var(--surface-sunken)',
    borderColor: 'var(--border-default)',
    borderStyle: 'solid',
    color: 'var(--text-subtle)',
    opacity: 'var(--opacity-muted)',
  },
  // Часът се показва и тук. Празната клетка изглежда като недоредувал екран, а
  // и на излязъл посетител това състояние покрива половината грид: `/slots/free`
  // връща само свободните, тоест заетото и блокираното стигат дотук.
  none: {
    background: 'var(--surface-sunken)',
    borderColor: 'var(--border-default)',
    borderStyle: 'solid',
    color: 'var(--text-subtle)',
    opacity: 'var(--opacity-muted)',
  },
};

// Часът в мострата е примерен и еднакъв на всички езици — 24-часов, в mono,
// както в самия грид.
const SAMPLE_TIME = '09:00';

const SELECTED = {
  background: 'var(--blue-400)',
  borderColor: 'var(--blue-400)',
  borderStyle: 'solid',
  color: 'var(--navy-900)',
};

function cellStyle({ background, borderColor, borderStyle, color, textDecoration, opacity }) {
  return {
    fontFamily: 'var(--font-mono)',
    fontWeight: 'var(--fw-mono)',
    fontSize: 'var(--text-body-sm)',
    borderRadius: 'var(--radius)',
    border: `var(--border-width) ${borderStyle} ${borderColor}`,
    background,
    color,
    textDecoration: textDecoration ?? 'none',
    opacity: opacity ?? 1,
  };
}

export default function SlotGrid({
  days = [],
  value,
  onSelect,
  labels = {},
  legend = [],
  style,
  ...rest
}) {
  return (
    <div>
      <div className="sirma-slot-grid-scroll">
        <div
          className="sirma-slot-grid"
          style={{ '--slot-grid-days': days.length, ...style }}
          {...rest}
        >
          {days.map((day) => (
            <div
              key={day.key}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
            >
              <div
                style={{
                  height: 'var(--slot-day-header-height)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius)',
                  background: 'var(--surface-sunken)',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--text-micro)',
                    fontWeight: 'var(--fw-semibold)',
                    letterSpacing: 'var(--ls-label)',
                    textTransform: 'uppercase',
                    color: 'var(--text-subtle)',
                  }}
                >
                  {day.weekday}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 'var(--fw-mono)',
                    fontSize: 'var(--text-body-md)',
                    color: 'var(--navy-900)',
                    marginTop: 'var(--space-1)',
                  }}
                >
                  {day.label}
                </div>
              </div>

              {day.slots.map((slot) => {
                const active = value === slot.id;
                const state = slot.state ?? 'none';
                const label = labels[state];
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={state !== 'free'}
                    aria-pressed={active}
                    // Иначе разликата между заето, блокирано и минало е само
                    // видима — екранният четец чува седем еднакви часа.
                    aria-label={label ? `${slot.time} — ${label}` : undefined}
                    onClick={() => onSelect?.(slot)}
                    style={{
                      ...cellStyle(active ? SELECTED : STATES[state]),
                      height: 'var(--slot-cell-height)',
                      padding: 0,
                      cursor: state === 'free' ? 'pointer' : 'not-allowed',
                      transition: 'background var(--dur) var(--ease)',
                    }}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {legend.length > 0 && (
        <ul
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            listStyle: 'none',
            padding: 0,
            margin: 'var(--space-4) 0 0',
          }}
        >
          {legend.map((state) => (
            <li
              key={state}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: 'var(--text-caption)',
                color: 'var(--text-muted)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  ...cellStyle(state === 'selected' ? SELECTED : STATES[state]),
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'var(--legend-swatch-width)',
                  height: 'var(--legend-swatch-height)',
                  fontSize: 'var(--text-micro)',
                }}
              >
                {SAMPLE_TIME}
              </span>
              {labels[state]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
