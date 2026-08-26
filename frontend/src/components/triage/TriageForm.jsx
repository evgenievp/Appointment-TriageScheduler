import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, QuestionCard, Radio } from '../ds';
import PainScale from './PainScale';

// Четирите въпроса от `TriageRequestDto`. Всички са задължителни, и то не само
// защото бекендът валидира: `calculateScore` разопакова `highTemperature` и
// `swelling` без проверка за null, тоест липсващо поле е 500, не 400.
//
// Score-ът не се показва тук. Той е самооценка, не преценка на лекар — видим
// праг само кани да се преиграе, а числото не значи нищо без клиничен контекст.
// Сметката се прави на сървъра; ние пращаме само отговорите.

const DURATIONS = ['LESS_THAN_DAY', 'ONE_DAY', 'THREE_DAYS', 'ONE_WEEK', 'MORE_THAN_WEEK'];

const EMPTY = {
  painLevel: null,
  painDuration: null,
  highTemperature: null,
  swelling: null,
};

export default function TriageForm({ value, onChange, onSubmit, submitLabel, busy }) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  // Отговорите могат да живеят навън, за да преживеят смяна на слота.
  const [own, setOwn] = useState(EMPTY);
  const answers = value ?? own;
  const set = (field) => (next) => {
    const updated = { ...answers, [field]: next };
    setOwn(updated);
    onChange?.(updated);
  };

  const missing = Object.entries(answers)
    .filter(([, given]) => given === null || given === undefined)
    .map(([field]) => field);

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!missing.length) onSubmit(answers);
  };

  const errorFor = (field) =>
    submitted && missing.includes(field) ? t('triage.required') : null;

  const yesNo = (field) => (
    <>
      <Radio
        name={field}
        label={t('triage.yes')}
        checked={answers[field] === true}
        onChange={() => set(field)(true)}
      />
      <Radio
        name={field}
        label={t('triage.no')}
        checked={answers[field] === false}
        onChange={() => set(field)(false)}
      />
    </>
  );

  const hint = (field) =>
    errorFor(field) && (
      <p style={{ fontSize: 'var(--text-caption)', color: 'var(--danger)' }}>
        {errorFor(field)}
      </p>
    );

  return (
    <form onSubmit={submit} noValidate>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        <QuestionCard
          step={1}
          total={4}
          question={t('triage.pain.question')}
          help={t('triage.pain.help')}
        >
          <PainScale value={answers.painLevel} onChange={set('painLevel')} />
          {hint('painLevel')}
        </QuestionCard>

        <QuestionCard step={2} total={4} question={t('triage.duration.question')}>
          {DURATIONS.map((option) => (
            <Radio
              key={option}
              name="painDuration"
              label={t(`triage.duration.${option}`)}
              checked={answers.painDuration === option}
              onChange={() => set('painDuration')(option)}
            />
          ))}
          {hint('painDuration')}
        </QuestionCard>

        <QuestionCard
          step={3}
          total={4}
          question={t('triage.temperature.question')}
          help={t('triage.temperature.help')}
        >
          {yesNo('highTemperature')}
          {hint('highTemperature')}
        </QuestionCard>

        <QuestionCard
          step={4}
          total={4}
          question={t('triage.swelling.question')}
          help={t('triage.swelling.help')}
        >
          {yesNo('swelling')}
          {hint('swelling')}
        </QuestionCard>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          marginTop: 'var(--space-6)',
        }}
      >
        <Button type="submit" disabled={busy}>
          {busy ? t('triage.sending') : submitLabel}
        </Button>
        <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--text-muted)' }}>
          {submitted && missing.length
            ? t('triage.missing', { count: missing.length })
            : t('triage.privacy')}
        </span>
      </div>
    </form>
  );
}
