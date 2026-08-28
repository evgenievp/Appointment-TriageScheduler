import { useTranslation } from 'react-i18next';
import { Stepper } from '../ds';

// Трите стъпки на записването, в реда, който обещава началната страница.
// Стои на едно място, защото се показва на три различни страници и разминаване
// в надписите щеше да се забележи веднага.
//
// Регистратурата минава по същия път, но има четвърта стъпка: часът се задържа
// на служителя и чак после отива при пациента.
export default function BookingSteps({ current, style, forStaff }) {
  const { t } = useTranslation();

  return (
    <Stepper
      steps={[
        t('booking.steps.triage'),
        t('booking.steps.doctor'),
        t('booking.steps.time'),
        ...(forStaff ? [t('booking.steps.patient')] : []),
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
