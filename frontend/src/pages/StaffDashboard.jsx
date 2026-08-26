import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import AppointmentsList from '../components/appointments/AppointmentsList';
import CancelAppointmentButton from '../components/appointments/CancelAppointmentButton';
import { Button, Input } from '../components/ds';
import { getStaffAppointments } from '../api/appointments';
import { formatDayLong, formatWeekday, shiftDateInput, toDateInput } from '../lib/dates';
import { useNow } from '../lib/useNow';
import './StaffDashboard.css';

// A day at a time, in time order. Reception reads a day the way it runs — the
// urgent cases get their own queue above this list rather than re-sorting it.
export default function StaffDashboard() {
  const { t, i18n } = useTranslation();
  const now = useNow();

  // null means "today" and keeps meaning it after midnight; picking a date pins it.
  const [picked, setPicked] = useState(null);
  const today = toDateInput(new Date(now));
  const date = picked ?? today;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['appointments', 'staff', date],
    queryFn: () => getStaffAppointments(date),
  });

  const appointments = [...(data ?? [])].sort((a, b) =>
    a.appointmentTime.localeCompare(b.appointmentTime),
  );

  const at = new Date(`${date}T00:00:00`);
  const shift = (days) => setPicked(shiftDateInput(date, days));

  return (
    <PageShell active="staff">
      <h1>{t('pages.staffDashboard.title')}</h1>
      <p
        style={{
          color: 'var(--text-muted)',
          marginTop: 'var(--space-3)',
          marginBottom: 'var(--space-8)',
        }}
      >
        {t('pages.staffDashboard.lead')}
      </p>

      <div className="staff-daybar">
        <div>
          <div
            style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--ls-heading)',
              color: 'var(--navy-900)',
            }}
          >
            {formatDayLong(at, i18n.resolvedLanguage)}
          </div>
          <div
            style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--text-muted)',
              marginTop: 'var(--space-1)',
            }}
          >
            {formatWeekday(at, i18n.resolvedLanguage)}
            {date === today && ` · ${t('pages.staffDashboard.isToday')}`}
            {!isPending && !isError && ` · ${t('pages.staffDashboard.count', { count: appointments.length })}`}
          </div>
        </div>

        <div className="staff-daybar__controls">
          <Button size="sm" variant="secondary" onClick={() => shift(-1)}>
            ← {t('pages.staffDashboard.prev')}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setPicked(null)}>
            {t('pages.staffDashboard.today')}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => shift(1)}>
            {t('pages.staffDashboard.next')} →
          </Button>
          <div className="staff-daybar__date">
            <Input
              type="date"
              mono
              aria-label={t('pages.staffDashboard.pickDate')}
              value={date}
              onChange={(event) => setPicked(event.target.value)}
            />
          </div>
        </div>
      </div>

      <AppointmentsList
        variant="staff"
        appointments={appointments}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        emptyTitle={t('pages.staffDashboard.emptyTitle')}
        emptyText={t('pages.staffDashboard.emptyText')}
        actions={(appointment) => <CancelAppointmentButton appointment={appointment} />}
      />
    </PageShell>
  );
}
