import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import AppointmentsList from '../components/appointments/AppointmentsList';
import CancelAppointmentButton from '../components/appointments/CancelAppointmentButton';
import RescheduleButton from '../components/appointments/RescheduleButton';
import PriorityQueue from '../components/staff/PriorityQueue';
import { Button, DatePicker, Icon, Select } from '../components/ds';
import { getStaffAppointments } from '../api/appointments';
import { getDoctors } from '../api/doctors';
import { formatDayLong, formatWeekday, shiftDateInput, toDateInput } from '../lib/dates';
import { useNow } from '../lib/useNow';
import './StaffDashboard.css';

// A day at a time, in time order. Reception reads a day the way it runs — the
// urgent cases get their own queue above this list rather than re-sorting it.
export default function StaffDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const now = useNow();

  // null means "today" and keeps meaning it after midnight; picking a date pins it.
  const [picked, setPicked] = useState(null);
  // The urgent case opened from the queue, so the list can mark the same row.
  const [selectedId, setSelectedId] = useState(null);
  // '' значи всички лекари.
  const [doctorId, setDoctorId] = useState('');
  const today = toDateInput(new Date(now));
  const date = picked ?? today;

  const openFromQueue = (appointment) => {
    setPicked(appointment.appointmentTime.slice(0, 10));
    setSelectedId(appointment.appointmentId);
    // Иначе редът, който току-що избра, остава скрит зад филтъра.
    setDoctorId('');
  };

  // Сървърът връща всички резервации наведнъж, затова ключът не носи датата:
  // смяната на деня не тръгва по мрежата, а само пресява вече взетото. Същият
  // отговор ползва и опашката със спешните.
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['appointments', 'staff'],
    queryFn: getStaffAppointments,
  });

  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors });

  const appointments = (data ?? [])
    .filter((a) => a.appointmentTime.startsWith(date))
    .filter((a) => !doctorId || a.doctorId === Number(doctorId))
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

  const at = new Date(`${date}T00:00:00`);
  const shift = (days) => setPicked(shiftDateInput(date, days));

  return (
    <PageShell active="staff">
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-8)',
        }}
      >
        <div>
          <h1>{t('pages.staffDashboard.title')}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
            {t('pages.staffDashboard.lead')}
          </p>
        </div>
        <Button
          onClick={() => navigate('/staff/new')}
          iconLeft={<Icon name="phone" size="var(--icon-sm)" />}
        >
          {t('pages.staffDashboard.newByPhone')}
        </Button>
      </div>

      {/* Above the day bar on purpose: an urgent case does not stop being urgent
          because reception is looking at another date. */}
      <PriorityQueue
        selectedId={selectedId}
        onPick={openFromQueue}
        actions={(appointment) => (
          <>
            <RescheduleButton appointment={appointment} />
            <CancelAppointmentButton appointment={appointment} />
          </>
        )}
      />

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
            <DatePicker
              label={t('pages.staffDashboard.pickDate')}
              value={date}
              onChange={setPicked}
              // Полето е долепено вдясно — панелът се отваря наляво от него,
              // иначе излиза извън екрана.
              align="right"
            />
          </div>
        </div>
      </div>

      {/* Филтърът е под лентата с деня, а не в нея: там вече има три бутона и поле
          за дата, а и е за списъка отдолу, не за навигацията. */}
      <div className="staff-filter">
        <Select
          label={t('pages.staffDashboard.doctorFilter')}
          value={doctorId}
          onChange={(event) => setDoctorId(event.target.value)}
        >
          <option value="">{t('pages.staffDashboard.allDoctors')}</option>
          {(doctors ?? []).map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </Select>
      </div>

      <AppointmentsList
        variant="staff"
        appointments={appointments}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        emptyTitle={t(doctorId ? 'pages.staffDashboard.emptyForDoctorTitle' : 'pages.staffDashboard.emptyTitle')}
        emptyText={t(doctorId ? 'pages.staffDashboard.emptyForDoctorText' : 'pages.staffDashboard.emptyText')}
        highlightId={selectedId}
        actions={(appointment) => (
          <>
            <RescheduleButton appointment={appointment} />
            <CancelAppointmentButton appointment={appointment} />
          </>
        )}
      />
    </PageShell>
  );
}
