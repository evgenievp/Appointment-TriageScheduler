import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import ExceptionDays from '../components/doctor/ExceptionDays';
import {
  Button,
  Card,
  DatePicker,
  EmptyState,
  ErrorState,
  Icon,
  Select,
  SlotGrid,
} from '../components/ds';
import { getCurrentDoctor } from '../api/doctors';
import { previewSlots, setSlotTime } from '../api/slots';
import {
  addDays,
  formatDayLong,
  formatDayMonth,
  formatWeekday,
  startOfWeek,
  toDateInput,
} from '../lib/dates';
import { buildSlotColumns } from '../lib/slotColumns';
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


function groupByDay(slots) {
  const days = new Map();
  slots.forEach((slot) => {
    const date = slot.startTime.slice(0, 10);
    if (!days.has(date)) days.set(date, []);
    days.get(date).push(slot);
  });
  return [...days.entries()];
}

// Прегледът показва същия седмичен грид като календара на пациента, а не списък
// с редове: така лекарят вижда какво ще получи, вместо да го чете като таблица.
//
// Периодът стига до 92 дни, тоест до 14 седмици. Показва се по една наведнъж —
// четиринайсет грида един под друг правят страницата няколко хиляди пиксела и
// прегледът престава да е преглед. Всяка седмица се строи от своите слотове,
// значи стъпката и обхватът се смятат за нея, както в календара.
function groupByWeek(slots, locale) {
  const weeks = new Map();

  slots.forEach((slot) => {
    const at = new Date(`${slot.startTime.slice(0, 10)}T00:00:00`);
    const key = toDateInput(startOfWeek(at));
    if (!weeks.has(key)) weeks.set(key, []);
    weeks.get(key).push(slot);
  });

  return [...weeks.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, weekSlots]) => {
      const monday = new Date(`${key}T00:00:00`);
      const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

      return {
        key,
        // Диапазонът се сглобява в JSX-а през `calendar.week`, а не тук — иначе
        // тирето между двете дати е единственият текст извън преводите.
        from: formatDayLong(days[0], locale),
        to: formatDayLong(days[6], locale),
        columns: buildSlotColumns(
          days.map((date) => ({
            key: toDateInput(date),
            weekday: formatWeekday(date, locale),
            label: formatDayMonth(date, locale),
          })),
          weekSlots,
          // Часовете още не съществуват — всички изглеждат свободни, но нищо не
          // се избира. `readOnly` на грида го прави явно.
          () => 'free',
        ),
      };
    });
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
  // Коя седмица от прегледа се гледа. Нулира се при всеки нов преглед, за да не
  // остане на индекс, който по-късият период вече няма.
  const [weekIndex, setWeekIndex] = useState(0);

  const set = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setPlanned(null);
    setWeekIndex(0);
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
    onSuccess: (result) => {
      setPlanned(result);
      setWeekIndex(0);
    },
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
    // Едно съобщение за всички провали. Запазен час в периода спира триенето на
    // ниво чужд ключ и излиза като 500 — но същият статус значи и истинска
    // повреда, а мрежов срив не носи статус изобщо. Разклонение по 500 щеше да
    // твърди „има запазени часове“ и в случаите, когато няма.
    onError: () =>
      showToast({
        tone: 'danger',
        title: t('pages.doctorSlots.failedTitle'),
        message: t('pages.doctorSlots.failedMessage'),
      }),
  });

  const submit = (event) => {
    event.preventDefault();
    if (!error && doctor) preview.mutate();
  };

  const days = planned ? groupByDay(planned) : [];
  const weeks = planned ? groupByWeek(planned, i18n.resolvedLanguage) : [];
  // Предпазен clamp: индексът се нулира навсякъде, където прегледът се сменя, но
  // ако някой път се пропусне, по-къс период не бива да остави екрана празен.
  const index = Math.min(weekIndex, Math.max(0, weeks.length - 1));
  const week = weeks[index];

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
              onChange={(value) => {
                setForm((current) => ({ ...current, startDate: value }));
                setPlanned(null);
                setWeekIndex(0);
              }}
            />
            <DatePicker
              label={t('pages.doctorSlots.endDate')}
              value={form.endDate}
              onChange={(value) => {
                setForm((current) => ({ ...current, endDate: value }));
                setPlanned(null);
                setWeekIndex(0);
              }}
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
                setWeekIndex(0);
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

          {/* Същият грид като в календара на пациента: лекарят вижда графика
              такъв, какъвто ще го види и той, вместо да го чете като списък.
              По една седмица наведнъж — навигацията е ограничена до седмиците в
              периода, извън тях няма какво да се покаже. */}
          {week && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--space-4)',
                  flexWrap: 'wrap',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <div style={{ ...mono, color: 'var(--navy-900)' }}>
                  {t('calendar.week', { from: week.from, to: week.to })}
                  {weeks.length > 1 && (
                    <span style={{ color: 'var(--text-muted)', marginLeft: 'var(--space-3)' }}>
                      {t('pages.doctorSlots.weekOf', {
                        index: index + 1,
                        total: weeks.length,
                      })}
                    </span>
                  )}
                </div>

                {/* Няма „тази седмица“ както в календара: периодът е в бъдещето и
                    текущата седмица обикновено не е в него. */}
                {weeks.length > 1 && (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={index === 0}
                      onClick={() => setWeekIndex(index - 1)}
                    >
                      ← {t('calendar.prevWeek')}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={index === weeks.length - 1}
                      onClick={() => setWeekIndex(index + 1)}
                    >
                      {t('calendar.nextWeek')} →
                    </Button>
                  </div>
                )}
              </div>

              <SlotGrid days={week.columns} readOnly />
            </>
          )}

          <Button
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            style={{ marginTop: 'var(--space-6)' }}
          >
            {t(generate.isPending ? 'pages.doctorSlots.generating' : 'pages.doctorSlots.generate')}
          </Button>
        </Card>
      )}

      <ExceptionDays
        onChange={() => {
          setPlanned(null);
          setWeekIndex(0);
        }}
      />
    </PageShell>
  );
}
