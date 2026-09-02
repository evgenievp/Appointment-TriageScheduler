import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import ExceptionDays from '../components/doctor/ExceptionDays';
import {
  Badge,
  Button,
  Card,
  DatePicker,
  EmptyState,
  ErrorState,
  Icon,
  Select,
} from '../components/ds';
import { getCurrentDoctor } from '../api/doctors';
import { previewSlots, setSlotTime } from '../api/slots';
import { addDays, formatDayLong, formatWeekday, toDateInput } from '../lib/dates';
import { useToast } from '../lib/toastContext';
import './DoctorSlots.css';

const mono = { fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-mono)' };

// The backend has no upper bound on the range; a mistyped year would create tens
// of thousands of rows, so the form refuses anything past a quarter.
const MAX_DAYS = 92;

// `<input type="time">` paints itself in the browser's language, not the app's,
// so an English browser turns a Bulgarian page into 09:00 AM. The slots are on
// half-hour boundaries anyway, so a list of them is both stricter and always
// 24-hour.
const SLOT_MINUTES = 30;
const HOURS = Array.from({ length: ((22 - 6) * 60) / SLOT_MINUTES + 1 }, (_, i) => {
  const minutes = 6 * 60 + i * SLOT_MINUTES;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(
    minutes % 60,
  ).padStart(2, '0')}`;
});

// Продължителност на един преглед. Списък, а не свободно поле: сървърът приема
// всяко положително число, но стойност, която не дели работния ден, оставя
// увиснал остатък в края, а произволни минути правят графика нечетим.
// Началото на деня се избира на половин час, затова 15 е най-дребната смислена.
const DURATIONS = [15, 20, 30, 45, 60];

const dayCount = (from, to) =>
  Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86_400_000) + 1;

// "2026-08-13T09:00:00" → "09:00". Taken as it comes — Intl would turn it into a
// 12-hour clock for some locales and the design is 24-hour.
const timeLabel = (startTime) => startTime.slice(11, 16);

function groupByDay(slots) {
  const days = new Map();
  slots.forEach((slot) => {
    const date = slot.startTime.slice(0, 10);
    if (!days.has(date)) days.set(date, []);
    days.get(date).push(slot);
  });
  return [...days.entries()];
}

export default function DoctorSlots() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useToast();

  const { data: doctor } = useQuery({ queryKey: ['doctor', 'me'], queryFn: getCurrentDoctor });

  const today = new Date();
  const [form, setForm] = useState({
    startDate: toDateInput(addDays(today, 1)),
    endDate: toDateInput(addDays(today, 30)),
    workStart: '09:00',
    workEnd: '18:00',
    slotTime: 30,
  });
  const [planned, setPlanned] = useState(null);

  const set = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setPlanned(null);
  };

  const error =
    form.endDate < form.startDate
      ? t('pages.doctorSlots.errors.dateOrder')
      : form.workEnd <= form.workStart
        ? t('pages.doctorSlots.errors.timeOrder')
        : dayCount(form.startDate, form.endDate) > MAX_DAYS
          ? t('pages.doctorSlots.errors.tooLong', { days: MAX_DAYS })
          : null;

  const payload = () => ({ doctorId: doctor.id, ...form });

  const preview = useMutation({
    mutationFn: () => previewSlots(payload()),
    onSuccess: setPlanned,
  });

  // Прегенерира периода с новата продължителност: трие и създава наново, за да
  // не се смесват слотове с различна дължина. Затова и не връща списък —
  // календарът се презарежда от инвалидирането.
  const generate = useMutation({
    mutationFn: () => setSlotTime(form.slotTime, form),
    onSuccess: () => {
      // Отговорът е само текст „Success!“ — броят идва от прегледа, който вече е
      // пред лекаря, а не от записването.
      const count = planned?.length ?? 0;
      setPlanned(null);
      // The calendar and the free-slot lists are stale the moment this returns.
      queryClient.invalidateQueries({ queryKey: ['slots'] });

      showToast({
        tone: 'success',
        title: t('pages.doctorSlots.createdTitle'),
        message: t('pages.doctorSlots.createdMessage', { count }),
      });
    },
    // Запазен час в периода спира триенето на ниво чужд ключ и сървърът връща
    // 500. Данни не се губят, но лекарят трябва да разбере, че причината е зает
    // час, а не повреда — иначе ще опитва наново до безкрай.
    onError: (err) =>
      showToast({
        tone: 'danger',
        title: t('pages.doctorSlots.failedTitle'),
        message: t(
          err?.status === 500
            ? 'pages.doctorSlots.bookedMessage'
            : 'pages.doctorSlots.failedMessage',
        ),
      }),
  });

  const submit = (event) => {
    event.preventDefault();
    if (!error && doctor) preview.mutate();
  };

  const days = planned ? groupByDay(planned) : [];

  return (
    <PageShell active="slots">
      <h1>{t('pages.doctorSlots.title')}</h1>
      <p
        style={{
          color: 'var(--text-muted)',
          marginTop: 'var(--space-3)',
          marginBottom: 'var(--space-8)',
          maxWidth: 'var(--measure-prose)',
        }}
      >
        {t('pages.doctorSlots.lead')}
      </p>

      <Card>
        <form onSubmit={submit} noValidate>
          <div className="slots-fields">
            <DatePicker
              label={t('pages.doctorSlots.startDate')}
              value={form.startDate}
              onChange={(value) => setForm((current) => ({ ...current, startDate: value }))}
            />
            <DatePicker
              label={t('pages.doctorSlots.endDate')}
              value={form.endDate}
              onChange={(value) => setForm((current) => ({ ...current, endDate: value }))}
            />
            <Select
              label={t('pages.doctorSlots.workStart')}
              mono
              value={form.workStart}
              onChange={set('workStart')}
            >
              {HOURS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Select>
            <Select
              label={t('pages.doctorSlots.workEnd')}
              mono
              value={form.workEnd}
              onChange={set('workEnd')}
            >
              {HOURS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Select>
            {/* Стойността е число за сървъра — `<option value>` винаги е низ,
                затова се превръща тук, а не при изпращането. */}
            <Select
              label={t('pages.doctorSlots.slotTime')}
              mono
              value={String(form.slotTime)}
              onChange={(event) => {
                const slotTime = Number(event.target.value);
                setForm((current) => ({ ...current, slotTime }));
                setPlanned(null);
              }}
            >
              {DURATIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {t('pages.doctorSlots.minutes', { minutes })}
                </option>
              ))}
            </Select>
          </div>

          {/* The rule applies to the whole range, not to one field, and the error
              takes its place so the form does not jump — same as Input does. */}
          <p
            style={{
              marginTop: 'var(--space-4)',
              fontSize: 'var(--text-caption)',
              color: error ? 'var(--danger)' : 'var(--text-muted)',
            }}
          >
            {error || t('pages.doctorSlots.rules')}
          </p>

          <Button
            type="submit"
            disabled={Boolean(error) || !doctor || preview.isPending}
            style={{ marginTop: 'var(--space-6)' }}
          >
            {t(preview.isPending ? 'pages.doctorSlots.previewing' : 'pages.doctorSlots.preview')}
          </Button>
        </form>
      </Card>

      {preview.isError && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <ErrorState
            icon={<Icon name="triangle-alert" size="var(--icon-md)" />}
            title={t('pages.doctorSlots.failedTitle')}
            description={t('pages.doctorSlots.failedMessage')}
            action={<Button onClick={() => preview.mutate()}>{t('common.retry')}</Button>}
          />
        </div>
      )}

      {planned && !planned.length && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <EmptyState
            icon={<Icon name="calendar-x" size="var(--icon-md)" />}
            title={t('pages.doctorSlots.emptyTitle')}
            description={t('pages.doctorSlots.emptyText')}
          />
        </div>
      )}

      {planned?.length > 0 && (
        <Card tone="sunken" style={{ marginTop: 'var(--space-6)' }}>
          <p style={{ marginBottom: 'var(--space-4)' }}>
            <Trans
              i18nKey="pages.doctorSlots.summary"
              values={{ slots: planned.length, days: days.length }}
              components={{ mono: <span style={mono} /> }}
            />
          </p>

          <div className="slots-preview">
            {days.map(([date, daySlots]) => {
              const at = new Date(`${date}T00:00:00`);
              return (
                <div key={date} className="slots-day">
                  <span>
                    {formatDayLong(at, i18n.resolvedLanguage)},{' '}
                    <span style={{ color: 'var(--text-muted)' }}>
                      {formatWeekday(at, i18n.resolvedLanguage)}
                    </span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{ ...mono, color: 'var(--text-muted)' }}>
                      {timeLabel(daySlots[0].startTime)} –{' '}
                      {timeLabel(daySlots[daySlots.length - 1].endTime)}
                    </span>
                    <Badge tone="blue" mono>
                      {t('pages.doctorSlots.slotsShort', { count: daySlots.length })}
                    </Badge>
                  </span>
                </div>
              );
            })}
          </div>

          <Button
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            style={{ marginTop: 'var(--space-6)' }}
          >
            {t(generate.isPending ? 'pages.doctorSlots.generating' : 'pages.doctorSlots.generate')}
          </Button>
        </Card>
      )}

      <ExceptionDays onChange={() => setPlanned(null)} />
    </PageShell>
  );
}
