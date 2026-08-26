import { useTranslation } from 'react-i18next';

// Числата се цъкат едно до друго, а не през плъзгач или падащо меню: плъзгачът е
// неточен с пръст, а менюто крие скалата. Десетте стойности се виждат наведнъж.
//
// Отдолу са двата края с думи — голо „1–10“ не значи нищо, ако не е казано кое е
// кое. Скалата е тази на бекенда: `calculateScore` дели на 4, 7 и 9.

export default function PainScale({ value, onChange, name = 'painLevel' }) {
  const { t } = useTranslation();

  return (
    <div>
      <div
        className="sirma-scale"
        role="radiogroup"
        aria-label={t('triage.pain.question')}
        style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
          const checked = value === level;

          return (
            <label key={level} style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                name={name}
                value={level}
                checked={checked}
                onChange={() => onChange(level)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
              <span
                className={checked ? 'sirma-scale__step' : undefined}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'var(--icon-btn-size)',
                  height: 'var(--icon-btn-size)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 'var(--fw-mono)',
                  fontSize: 'var(--text-body-md)',
                  border:
                    'var(--border-width) solid ' +
                    (checked ? 'var(--blue-400)' : 'var(--border-default)'),
                  background: checked ? 'var(--surface-selected)' : 'var(--white)',
                  color: 'var(--navy-900)',
                  transition: 'background var(--dur) var(--ease)',
                }}
              >
                {level}
              </span>
            </label>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-3)',
          fontSize: 'var(--text-caption)',
          color: 'var(--text-muted)',
        }}
      >
        <span>{t('triage.pain.low')}</span>
        <span>{t('triage.pain.high')}</span>
      </div>
    </div>
  );
}
