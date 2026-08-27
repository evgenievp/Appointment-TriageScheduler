import { Fragment } from 'react';

// Пренесен от Claude Design (components/navigation/Stepper.jsx).
// Номерата са в mono, а кръгът е едно от малкото места, където системата го
// позволява — иначе радиусът е 8px навсякъде.
//
// Оригиналът е с 26px/12px/10px/14px; сведени са до скалата и до нов токен
// `--stepper-dot`, затова не съвпадат едно към едно с бъндъла.
//
// Добавено спрямо него: `aria-current` на текущата стъпка и текстов еквивалент
// на състоянието, иначе „готово“ и „предстои“ се различават само по цвят.

export default function Stepper({ steps = [], current = 0, labels, style, ...rest }) {
  return (
    <ol
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        flexWrap: 'wrap',
        ...style,
      }}
      {...rest}
    >
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;

        return (
          <Fragment key={step}>
            <li
              aria-current={active ? 'step' : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 'var(--stepper-dot)',
                  height: 'var(--stepper-dot)',
                  flex: '0 0 var(--stepper-dot)',
                  borderRadius: 'var(--radius-circle)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 'var(--fw-mono)',
                  fontSize: 'var(--text-caption)',
                  background: done
                    ? 'var(--blue-100)'
                    : active
                      ? 'var(--blue-400)'
                      : 'var(--neutral-100)',
                  color: active || done ? 'var(--navy-900)' : 'var(--text-subtle)',
                  border:
                    'var(--border-width) solid ' +
                    (active ? 'var(--blue-400)' : 'transparent'),
                }}
              >
                {index + 1}
              </span>
              <span
                style={{
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: active ? 'var(--fw-semibold)' : 'var(--fw-medium)',
                  color: active ? 'var(--navy-900)' : 'var(--text-muted)',
                }}
              >
                {step}
                {/* Иначе състоянието се носи само от цвят. */}
                {labels && (
                  <span
                    style={{
                      position: 'absolute',
                      width: 1,
                      height: 1,
                      overflow: 'hidden',
                      clip: 'rect(0 0 0 0)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {' '}
                    {done ? labels.done : active ? labels.current : labels.todo}
                  </span>
                )}
              </span>
            </li>
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                style={{
                  flex: 1,
                  height: 'var(--border-width)',
                  background: 'var(--border-default)',
                  minWidth: 'var(--space-4)',
                }}
              />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}
