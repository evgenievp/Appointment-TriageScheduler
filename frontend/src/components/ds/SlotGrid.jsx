// Пренесен от Claude Design (components/scheduling/SlotGrid.jsx).
//
// Едно отклонение от дизайна: там слотът се разпознава по низ „дата + час“,
// защото данните са измислени. Тук всеки слот носи `id` от бекенда и изборът
// е по него — иначе не можем да запишем конкретен слот.
//
// Всички колони споделят една времева ос, за да е 09:00 на един и същи ред във
// всеки ден. Където лекарят няма слот в този час, се рисува `unavailable` клетка —
// изглежда като заетите, но без задраскване: заетото го е взел някой, а това
// изобщо не се предлага.
//
// Гридът се скролва настрани при тесен екран (виж `.sirma-slot-grid` в ds/app.css),
// вместо колоните да се смачкат под четимото.
//
// days: [{ key, weekday, label, slots: [{ id, time, taken, unavailable }] }]
// value: id на избрания слот
// onSelect: (slot) => void

export default function SlotGrid({ days = [], value, onSelect, style, ...rest }) {
  return (
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
              const blocked = slot.taken || slot.unavailable;
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={blocked}
                  aria-pressed={active}
                  onClick={() => onSelect?.(slot)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 'var(--fw-mono)',
                    fontSize: 'var(--text-body-sm)',
                    height: 'var(--slot-cell-height)',
                    padding: 0,
                    borderRadius: 'var(--radius)',
                    cursor: blocked ? 'not-allowed' : 'pointer',
                    border:
                      'var(--border-width) solid ' +
                      (active ? 'var(--blue-400)' : 'var(--border-default)'),
                    background: active
                      ? 'var(--blue-400)'
                      : blocked
                        ? 'var(--neutral-100)'
                        : 'var(--white)',
                    color: blocked ? 'var(--text-subtle)' : 'var(--navy-900)',
                    textDecoration: slot.taken ? 'line-through' : 'none',
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
  );
}
