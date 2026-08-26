import { useTranslation } from 'react-i18next';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Card, PriorityQueueRow } from '../ds';
import { getStaffAppointments } from '../../api/appointments';
import { getTriageResult, parseAnswers } from '../../api/triage';
import { formatDayShort, fromLocalDateTime } from '../../lib/dates';
import { useNow } from '../../lib/useNow';

// The urgent cases are a second lens over the schedule, not a re-sort of it: the
// day list below has to stay in time order, which is how a clinic reads a day.
//
// It deliberately ignores the day being viewed — an urgent case does not stop
// being urgent because reception is looking at another date. Clicking a row
// opens its day below.
//
// The block disappears when nothing is urgent; an empty "no urgent cases" box
// would be noise on most days.
//
// Priority comes from AppointmentDto, so filtering costs nothing. Only the score
// and the answers need a request each, and only for the few urgent rows.

const MAX_SCORE = 10; // TriageService: 3 + 3 + 2 + 2, urgent at 5 and above

export default function PriorityQueue({ selectedId, onPick, actions }) {
  const { t, i18n } = useTranslation();
  const now = useNow();

  const { data } = useQuery({
    queryKey: ['appointments', 'staff', 'all'],
    queryFn: () => getStaffAppointments(),
  });

  // A visit that has already happened needs nothing from reception.
  const urgent = (data ?? [])
    .filter(
      (a) =>
        a.priority === 'URGENT' && fromLocalDateTime(a.appointmentTime).getTime() > now,
    )
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

  const results = useQueries({
    queries: urgent.map((appointment) => ({
      queryKey: ['triage', appointment.appointmentId],
      queryFn: () => getTriageResult(appointment.appointmentId),
      // A missing triage record is a 404 and answers the question on its own.
      retry: false,
      staleTime: Infinity,
    })),
  });

  if (!urgent.length) return null;

  const reasonOf = (answers) => {
    const parsed = parseAnswers(answers);
    if (!parsed) return null;

    return [
      parsed.painLevel != null &&
        t('staffQueue.pain', { level: parsed.painLevel, max: MAX_SCORE }),
      parsed.painDuration && t(`staffQueue.duration.${parsed.painDuration}`),
      parsed.highTemperature && t('staffQueue.temperature'),
      parsed.swelling && t('staffQueue.swelling'),
    ]
      .filter(Boolean)
      .join(' · ');
  };

  return (
    <Card
      tone="sunken"
      style={{ marginBottom: 'var(--space-8)', borderColor: 'var(--danger)' }}
    >
      <h2 style={{ fontSize: 'var(--text-h3)' }}>
        {t('staffQueue.title', { count: urgent.length })}
      </h2>
      <p
        style={{
          color: 'var(--text-strong-muted)',
          fontSize: 'var(--text-body-sm)',
          marginTop: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
        }}
      >
        {t('staffQueue.lead')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {urgent.map((appointment, index) => {
          const triage = results[index]?.data;
          const at = fromLocalDateTime(appointment.appointmentTime);

          return (
            <PriorityQueueRow
              key={appointment.appointmentId}
              priority="urgent"
              // By appointment, not by day: two urgent cases can share a date.
              selected={appointment.appointmentId === selectedId}
              onClick={onPick && (() => onPick(appointment))}
              patient={
                appointment.patientName ??
                t('appointments.patientFallback', { id: appointment.patientId })
              }
              reason={triage ? reasonOf(triage.answers) : t('staffQueue.noTriage')}
              score={triage ? `${triage.score}/${MAX_SCORE}` : undefined}
              scoreLabel={t('staffQueue.score')}
              waiting={`${formatDayShort(at, i18n.resolvedLanguage)} ${appointment.appointmentTime.slice(11, 16)}`}
              actions={actions?.(appointment)}
            />
          );
        })}
      </div>
    </Card>
  );
}
