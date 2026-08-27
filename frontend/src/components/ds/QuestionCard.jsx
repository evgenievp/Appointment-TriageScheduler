import { useId } from 'react';

// Пренесен от Claude Design (components/scheduling/QuestionCard.jsx).
// Броячът е в mono, както всяко число в системата.
//
// Оригиналът е с 24px/20px/14px/12px/8px; сведени са до скалата, затова не
// съвпадат едно към едно с бъндъла.
//
// Отклонение от оригинала: там въпросът е самотен `h3` без връзка с полетата под
// него — за екранен четец въпросът и отговорите са две несвързани неща. Тук
// картата е `role="group"` с `aria-labelledby`, така че въпросът се чете преди
// всеки отговор. При въпросник за здравословно състояние това не е козметика.
//
// `fieldset`/`legend` биха дали същото, но legend се рисува върху рамката и
// чупи картата — пробвано.

export default function QuestionCard({
  step,
  total,
  question,
  help,
  children,
  style,
  ...rest
}) {
  const questionId = useId();
  const helpId = useId();

  return (
    <div
      role="group"
      aria-labelledby={questionId}
      aria-describedby={help ? helpId : undefined}
      style={{
        background: 'var(--white)',
        border: 'var(--border-width) solid var(--border-default)',
        borderRadius: 'var(--radius)',
        padding: 'var(--card-padding)',
        ...style,
      }}
      {...rest}
    >
      {step != null && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 'var(--fw-mono)',
            fontSize: 'var(--text-caption)',
            color: 'var(--text-subtle)',
            marginBottom: 'var(--space-2)',
          }}
        >
          {step}
          {total ? ` / ${total}` : ''}
        </div>
      )}

      <h3
        id={questionId}
        style={{
          fontSize: 'var(--text-h3)',
          fontWeight: 'var(--fw-bold)',
          letterSpacing: 'var(--ls-heading)',
          lineHeight: 'var(--lh-heading)',
          color: 'var(--navy-900)',
          textWrap: 'balance',
          margin: 0,
        }}
      >
        {question}
      </h3>

      {help && (
        <p
          id={helpId}
          style={{
            fontSize: 'var(--text-body-sm)',
            color: 'var(--text-muted)',
            marginTop: 'var(--space-2)',
            maxWidth: 'var(--measure-prose)',
          }}
        >
          {help}
        </p>
      )}

      <div
        style={{
          marginTop: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
