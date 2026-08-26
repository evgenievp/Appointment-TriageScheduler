import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { AppointmentRow, Badge, Button, EmptyState, ErrorState, Icon, Skeleton } from '../ds';
import { getDoctors } from '../../api/doctors';
import { formatDayShort, fromLocalDateTime } from '../../lib/dates';
import { useNow } from '../../lib/useNow';

// One list for all three audiences. `AppointmentRow` keeps its design-system
// prop names, so the three lines are filled differently per variant rather than
// the component being changed:
//
//   patient  Д-р Иванов        Стоматология · Клиника Сирма
//   doctor   Мария Илиева      Клиника Сирма
//   staff    Мария Илиева      Д-р Иванов · Стоматология
//
// `doctorName` and `patientName` are not in the backend DTO yet, so both fall
// back: the doctor to the cached /api/doctors list, the patient to an id.
//
// The key is `appointmentId` — AppointmentDto spells it out, only SlotDto uses
// a bare `id`.
//
// Nothing marks a visit as done once it happens — the status stays CONFIRMED
// forever — so "past" is derived from the clock and the row recedes onto the
// sunken surface. Depth by contrast, as the system asks; dimming the whole row
// would only make it harder to read.

const tones = { CONFIRMED: 'blue', CANCELLED: 'neutral', DONE: 'free' };

export default function AppointmentsList({
  appointments,
  isPending,
  isError,
  onRetry,
  variant = 'patient',
  emptyTitle,
  emptyText,
  emptyAction,
  actions,
}) {
  const { t, i18n } = useTranslation();
  const now = useNow();
  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors });

  const doctorOf = (id) => doctors?.find((d) => d.id === id);

  if (isPending) {
    return <Skeleton variant="appointment-list" count={3} label={t('common.loading')} />;
  }

  if (isError) {
    return (
      <ErrorState
        icon={<Icon name="triangle-alert" size="var(--icon-md)" />}
        title={t('appointments.errorTitle')}
        description={t('appointments.errorText')}
        action={onRetry && <Button onClick={onRetry}>{t('common.retry')}</Button>}
      />
    );
  }

  if (!appointments?.length) {
    return (
      <EmptyState
        icon={<Icon name="calendar-x" size="var(--icon-md)" />}
        title={emptyTitle}
        description={emptyText}
        action={emptyAction}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {appointments.map((appointment) => {
        const at = fromLocalDateTime(appointment.appointmentTime);
        const isPast = at.getTime() <= now;
        const doctor = doctorOf(appointment.doctorId);
        const doctorName =
          appointment.doctorName ?? doctor?.name ?? `#${appointment.doctorId}`;
        const patientName =
          appointment.patientName ??
          t('appointments.patientFallback', { id: appointment.patientId });

        const lines =
          variant === 'patient'
            ? [doctorName, doctor?.speciality, t('common.clinicName')]
            : variant === 'doctor'
              ? [patientName, t('common.clinicName'), null]
              : [patientName, doctorName, doctor?.speciality];

        return (
          <AppointmentRow
            key={appointment.appointmentId}
            date={formatDayShort(at, i18n.resolvedLanguage)}
            time={appointment.appointmentTime.slice(11, 16)}
            doctor={lines[0]}
            specialty={lines[1]}
            location={lines[2]}
            style={isPast ? { background: 'var(--surface-sunken)' } : undefined}
            status={
              isPast && appointment.status === 'CONFIRMED' ? (
                <Badge tone="neutral">{t('appointments.status.past')}</Badge>
              ) : (
                <Badge tone={tones[appointment.status] ?? 'neutral'}>
                  {t(`appointments.status.${appointment.status}`, appointment.status)}
                </Badge>
              )
            }
            actions={actions?.(appointment)}
          />
        );
      })}
    </div>
  );
}
