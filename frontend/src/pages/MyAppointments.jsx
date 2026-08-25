import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import AppointmentsList from '../components/appointments/AppointmentsList';
import { Button } from '../components/ds';
import { getMyAppointments } from '../api/appointments';

export default function MyAppointments() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['appointments', 'me'],
    queryFn: getMyAppointments,
  });

  // The backend returns them in insertion order; the patient wants them by date.
  const appointments = [...(data ?? [])].sort((a, b) =>
    a.appointmentTime.localeCompare(b.appointmentTime),
  );

  return (
    <PageShell active="appointments">
      <h1>{t('pages.myAppointments.title')}</h1>
      <p
        style={{
          color: 'var(--text-muted)',
          marginTop: 'var(--space-3)',
          marginBottom: 'var(--space-8)',
        }}
      >
        {t('pages.myAppointments.lead')}
      </p>

      <AppointmentsList
        variant="patient"
        appointments={appointments}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        emptyTitle={t('pages.myAppointments.emptyTitle')}
        emptyText={t('pages.myAppointments.emptyText')}
        emptyAction={
          <Button onClick={() => navigate('/doctors')}>
            {t('pages.myAppointments.emptyAction')}
          </Button>
        }
      />
    </PageShell>
  );
}
