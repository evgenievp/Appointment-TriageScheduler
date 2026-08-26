// Пренесен от Claude Design (components/navigation/Tabs.jsx).
// Подчертаването е единственият сигнал за активен раздел — без фон, без рамка.
// Числото до етикета е в mono, както всяко число в системата.
//
// Оригиналът е с 10px/14px/12px; сведени са до скалата (--space-3 / --space-4 /
// --text-caption), затова не съвпадат едно към едно с бъндъла.
// Добавено спрямо него: role/aria-selected и `type="button"`.

export default function Tabs({ tabs = [], value, onChange, style, ...rest }) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: 'var(--space-1)',
        borderBottom: 'var(--border-width) solid var(--border-default)',
        flexWrap: 'wrap',
        ...style,
      }}
      {...rest}
    >
      {tabs.map((tab) => {
        const key = tab.value ?? tab;
        const active = key === value;

        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(key)}
            style={{
              background: 'transparent',
              border: 0,
              borderBottom:
                'var(--tab-indicator) solid ' +
                (active ? 'var(--blue-400)' : 'transparent'),
              padding: 'var(--space-3) var(--space-4)',
              marginBottom: 'calc(var(--border-width) * -1)',
              cursor: 'pointer',
              font: 'inherit',
              fontSize: 'var(--text-body-sm)',
              fontWeight: active ? 'var(--fw-semibold)' : 'var(--fw-medium)',
              color: active ? 'var(--navy-900)' : 'var(--text-muted)',
            }}
          >
            {tab.label ?? tab}
            {tab.count != null && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 'var(--fw-mono)',
                  fontSize: 'var(--text-caption)',
                  marginLeft: 'var(--space-2)',
                  color: 'var(--text-subtle)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
