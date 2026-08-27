import { useTranslation } from 'react-i18next';
import { Stepper } from '../ds';

// Трите стъпки на записването, в реда, който обещава началната страница.
// Стои на едно място, защото се показва на три различни страници и разминаване
// в надписите щеше да се забележи веднага.
export default function BookingSteps({ current, style }) {
  const { t } = useTranslation();

  return (
    <Stepper
      steps={[
        t('booking.steps.triage'),
        t('booking.steps.doctor'),
        t('booking.steps.time'),
      ]}
      current={current}
      labels={{
        done: t('booking.steps.done'),
        current: t('booking.steps.current'),
        todo: t('booking.steps.todo'),
      }}
      style={style}
    />
  );
}
