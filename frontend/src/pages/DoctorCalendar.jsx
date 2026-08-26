import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  Skeleton,
  SlotGrid,
} from '../components/ds';
import { getCalendarSlots } from '../api/slots';
import { getDoctors } from '../api/doctors';
import { bookSlot } from '../api/appointments';
import { useAuth } from '../lib/authContext';
import { useToast } from '../lib/toastContext';
import {
  addDays,
  endOfDay,
  formatDayLong,
  formatDayMonth,
  formatWeekday,
  fromLocalDateTime,
  startOfWeek,
  toLocalDateTime,
} from '../lib/dates';
import { useNow } from '../lib/useNow';

const mono = { fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-mono)' };
const dayKey = (date) => toLocalDateTime(date).slice(0, 10);
// "2026-08-13T09:00:00" → "09:00". Взима се както идва от сървъра — Intl би
// превърнал часа в 12-часов формат за някои езици, а дизайнът е 24-часов.
const timeLabel = (startTime) => startTime.slice(11, 16);

export default function DoctorCalendar() {
  const { id } = useParams();
  const doctorId = Number(id);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const showToast = useToast();
  const { isAuthenticated } = useAuth();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selected, setSelected] = useState(null);
  const now = useNow();

  const isPastTime = (startTime) => fromLocalDateTime(startTime).getTime() <= now;

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const from = toLocalDateTime(weekStart);
  const to = toLocalDateTime(endOfDay(days[6]));

  // Списъкът с лекари вече е в кеша от /doctors; тук само вадим името.
  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors });
  const doctor = doctors?.find((d) => d.id === doctorId);

  const {
    data: slots,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['slots', doctorId, from],
    queryFn: () => getCalendarSlots(doctorId, from, to),
  });

  const { mutate: book, isPending: isBooking } = useMutation({
    mutationFn: (slot) => bookSlot(slot.id),
    onSuccess: (_data, slot) => {
      showToast({
        tone: 'success',
        title: t('calendar.bookedTitle'),
        message: t('calendar.bookedMessage', { time: slot.time }),
      });
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      // Someone took the slot between loading the grid and the click.
      if (error.status === 409) {
        showToast({
          tone: 'danger',
          title: t('calendar.takenTitle'),
          message: t('calendar.takenMessage'),
        });
        setSelected(null);
        queryClient.invalidateQueries({ queryKey: ['slots'] });
        return;
      }
      showToast({
        tone: 'danger',
        title: t('calendar.failedTitle'),
        message: t('calendar.failedMessage'),
      });
    },
  });

  // Booking needs an account. Sending the visitor to the login screen beats
  // letting the request come back 401 and showing a vague failure.
  const bookOrSignIn = () => {
    if (!isAuthenticated) {
      navigate(`/login?from=${encodeURIComponent(location.pathname)}`);
      return;
    }
    book(pick);
  };

  // Общата времева ос за седмицата. Без нея всяка колона изброява само своите
  // слотове и 09:00 в четвъртък не пада на реда на 09:00 в петък.
  const times = [...new Set((slots ?? []).map((slot) => timeLabel(slot.startTime)))].sort();

  const gridDays = days.map((date) => {
    const key = dayKey(date);
    const byTime = new Map(
      (slots ?? [])
        .filter((slot) => slot.startTime.startsWith(key))
        .map((slot) => [timeLabel(slot.startTime), slot]),
    );

    return {
      key,
      weekday: formatWeekday(date, i18n.resolvedLanguage),
      label: formatDayMonth(date, i18n.resolvedLanguage),
      slots: times.map((time) => {
        const slot = byTime.get(time);
        if (!slot) return { id: `${key}-${time}`, time, unavailable: true };

        // A slot whose time has passed is inert, not "taken" — nobody booked
        // it, it simply cannot be booked any more, so it gets no strikethrough.
        const past = isPastTime(slot.startTime);
        return {
          id: slot.id,
          time,
          startTime: slot.startTime,
          taken: !past && slot.status !== 'FREE',
          unavailable: past,
        };
      }),
    };
  });

  const hasFreeSlot = gridDays.some((day) =>
    day.slots.some((slot) => !slot.taken && !slot.unavailable),
  );

  // A slot picked a while ago can slip into the past while the page sits open.
  const pick = selected && !isPastTime(selected.startTime) ? selected : null;

  const changeWeek = (delta) => {
    setSelected(null);
    setWeekStart((current) =>
      delta === 0 ? startOfWeek(new Date()) : addDays(current, delta * 7),
    );
  };

  return (
    <PageShell active="booking">
      <Button variant="ghost" onClick={() => navigate('/doctors')}>
        ← {t('calendar.backToDoctors')}
      </Button>

      <div style={{ marginTop: 'var(--space-4)' }}>
        <h1>{doctor?.name ?? '—'}</h1>
        {doctor && (
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
            {doctor.speciality}
          </p>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          margin: 'var(--space-8) 0 var(--space-4)',
        }}
      >
        <div style={{ ...mono, fontSize: 'var(--text-body-md)', color: 'var(--navy-900)' }}>
          {t('calendar.week', {
            from: formatDayLong(days[0], i18n.resolvedLanguage),
            to: formatDayLong(days[6], i18n.resolvedLanguage),
          })}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button size="sm" variant="secondary" onClick={() => changeWeek(-1)}>
            ← {t('calendar.prevWeek')}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => changeWeek(0)}>
            {t('calendar.today')}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => changeWeek(1)}>
            {t('calendar.nextWeek')} →
          </Button>
        </div>
      </div>

      {isPending && (
        <Skeleton variant="slot-grid" days={7} rows={8} label={t('common.loading')} />
      )}

      {isError && (
        <ErrorState
          icon={<Icon name="triangle-alert" size="var(--icon-md)" />}
          title={t('calendar.errorTitle')}
          description={t('calendar.errorText')}
          action={<Button onClick={() => refetch()}>{t('common.retry')}</Button>}
        />
      )}

      {!isPending && !isError && !hasFreeSlot && (
        <EmptyState
          icon={<Icon name="calendar-x" size="var(--icon-md)" />}
          title={t('calendar.emptyTitle')}
          description={t('calendar.emptyText')}
          action={<Button onClick={() => changeWeek(1)}>{t('calendar.nextWeek')} →</Button>}
        />
      )}

      {!isPending && !isError && hasFreeSlot && (
        <>
          <SlotGrid days={gridDays} value={pick?.id} onSelect={setSelected} />

          <Card
            tone="sunken"
            padding="var(--card-padding-sm)"
            style={{
              marginTop: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{ fontSize: 'var(--text-body-md)', color: 'var(--text-strong-muted)' }}
            >
              {pick ? (
                <Trans
                  i18nKey="calendar.selected"
                  values={{ time: `${pick.time}` }}
                  components={{ mono: <span style={mono} /> }}
                />
              ) : (
                t('calendar.pickPrompt')
              )}
            </span>
            <Button
              disabled={!pick || isBooking}
              onClick={bookOrSignIn}
              iconLeft={<Icon name="calendar-check" size="var(--icon-sm)" />}
            >
              {isBooking ? t('calendar.booking') : t('calendar.book')}
            </Button>
          </Card>
        </>
      )}
    </PageShell>
  );
}
