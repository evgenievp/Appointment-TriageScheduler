import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import AppointmentsList from '../components/appointments/AppointmentsList';
import { getDoctorAppointments } from '../api/appointments';

export default function DoctorAppointments() {
  const { t } = useTranslation();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['appointments', 'doctor'],
    queryFn: getDoctorAppointments,
  });

  const appointments = [...(data ?? [])].sort((a, b) =>
    a.appointmentTime.localeCompare(b.appointmentTime),
  );

  return (
    <PageShell active="doctor">
      <h1>{t('pages.doctorAppointments.title')}</h1>
      <p
        style={{
          color: 'var(--text-muted)',
          marginTop: 'var(--space-3)',
          marginBottom: 'var(--space-8)',
        }}
      >
        {t('pages.doctorAppointments.lead')}
      </p>

      <AppointmentsList
        variant="doctor"
        appointments={appointments}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        emptyTitle={t('pages.doctorAppointments.emptyTitle')}
        emptyText={t('pages.doctorAppointments.emptyText')}
      />
    </PageShell>
  );
}
