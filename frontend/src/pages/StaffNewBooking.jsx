import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageShell from '../components/PageShell';
import BookingSteps from '../components/triage/BookingSteps';
import { Button, Card, Icon } from '../components/ds';
import { useTriageDraft } from '../lib/triageDraft';

// Входът към записването по телефона. Няма собствен съветник: служителят минава
// по същите екрани като пациента — въпроси, лекар, час — и различен е само краят,
// където часът се прехвърля. Тази страница само обяснява реда и изчиства
// отговорите от предишен разговор.

export default function StaffNewBooking() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clear } = useTriageDraft();

  const start = () => {
    clear();
    navigate('/triage?from=/doctors');
  };

  return (
    <PageShell active="staff">
      <div style={{ maxWidth: 'var(--measure)' }}>
        <BookingSteps current={0} forStaff />

        <h1 style={{ marginTop: 'var(--space-8)' }}>{t('pages.staffNewBooking.title')}</h1>
        <p
          style={{
            color: 'var(--text-muted)',
            marginTop: 'var(--space-3)',
            maxWidth: 'var(--measure-prose)',
          }}
        >
          {t('pages.staffNewBooking.text')}
        </p>

        <Card tone="sunken" style={{ marginTop: 'var(--space-6)' }}>
          <p style={{ color: 'var(--text-strong-muted)' }}>
            {t('pages.staffNewBooking.holdNote')}
          </p>
        </Card>

        <Button
          onClick={start}
          iconLeft={<Icon name="calendar-check" size="var(--icon-sm)" />}
          style={{ marginTop: 'var(--space-6)' }}
        >
          {t('pages.staffNewBooking.start')}
        </Button>
      </div>
    </PageShell>
  );
}
