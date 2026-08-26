import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import AppointmentsList from '../components/appointments/AppointmentsList';
import CancelAppointmentButton from '../components/appointments/CancelAppointmentButton';
import { Button, Tabs } from '../components/ds';
import { getMyAppointments } from '../api/appointments';
import { fromLocalDateTime } from '../lib/dates';
import { useNow } from '../lib/useNow';

const byTime = (a, b) => a.appointmentTime.localeCompare(b.appointmentTime);

export default function MyAppointments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const now = useNow();
  const [tab, setTab] = useState('all');

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['appointments', 'me'],
    queryFn: getMyAppointments,
  });

  const all = data ?? [];
  const isPast = (appointment) =>
    fromLocalDateTime(appointment.appointmentTime).getTime() <= now;

  // Soonest visit first; past ones read better newest-first, since the most
  // recent is the one anybody looks for.
  const upcoming = all.filter((a) => !isPast(a)).sort(byTime);
  const past = all.filter(isPast).sort((a, b) => byTime(b, a));

  const shown = tab === 'upcoming' ? upcoming : tab === 'past' ? past : [...upcoming, ...past];

  const tabs = [
    { value: 'all', label: t('pages.myAppointments.tabs.all'), count: all.length },
    {
      value: 'upcoming',
      label: t('pages.myAppointments.tabs.upcoming'),
      count: upcoming.length,
    },
    { value: 'past', label: t('pages.myAppointments.tabs.past'), count: past.length },
  ];

  // Nothing booked ever is a different message from a tab that happens to be
  // empty — only the first deserves the call to action.
  const nothingAtAll = !all.length;
  const empty = nothingAtAll
    ? {
        title: t('pages.myAppointments.emptyTitle'),
        text: t('pages.myAppointments.emptyText'),
        action: (
          <Button onClick={() => navigate('/doctors')}>
            {t('pages.myAppointments.emptyAction')}
          </Button>
        ),
      }
    : {
        title: t(`pages.myAppointments.empty.${tab}`),
        text: t('pages.myAppointments.emptyTabText'),
      };

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

      {!isPending && !isError && !nothingAtAll && (
        <Tabs
          tabs={tabs}
          value={tab}
          onChange={setTab}
          style={{ marginBottom: 'var(--space-6)' }}
        />
      )}

      <AppointmentsList
        variant="patient"
        appointments={shown}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        emptyTitle={empty.title}
        emptyText={empty.text}
        emptyAction={empty.action}
        actions={(appointment) => <CancelAppointmentButton appointment={appointment} />}
      />
    </PageShell>
  );
}
