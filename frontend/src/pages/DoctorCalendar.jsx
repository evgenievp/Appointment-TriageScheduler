import { useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
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
import SignInRequired from '../components/SignInRequired';
import BookingSteps from '../components/triage/BookingSteps';
import useBookWithTriage from '../components/triage/useBookWithTriage';
import { getMyAppointments } from '../api/appointments';
import { getCalendarSlots, getFreeSlots } from '../api/slots';
import { getDoctors } from '../api/doctors';
import { useAuth } from '../lib/authContext';
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
import { useTriageDraft } from '../lib/triageDraft';
import { buildSlotColumns } from '../lib/slotColumns';

const mono = { fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-mono)' };
const dayKey = (date) => toLocalDateTime(date).slice(0, 10);

// A slot whose time has passed is inert, not "taken" — nobody booked it, it
// simply cannot be booked any more. BLOCKED is a third case: that is how a
// doctor's day off is marked, so the hour was never on offer. Telling the three
// apart is the whole point; lumping them together reads as "fully booked".
const slotState = (slot, past, mySlotIds) => {
  if (past) return 'past';
  if (slot.status === 'BOOKED') return mySlotIds.has(slot.id) ? 'mine' : 'taken';
  if (slot.status === 'BLOCKED') return 'blocked';
  return 'free';
};

// `/slots/free` дава само свободните, тоест на излязъл посетител заето и почивен
// ден изобщо не стигат до грида — обяснени в легендата, те биха били обещание за
// разлика, която той няма как да види.
const LEGEND = ['free', 'selected', 'mine', 'taken', 'blocked', 'past'];
const LEGEND_PUBLIC = ['free', 'selected', 'none'];

export default function DoctorCalendar() {
  const { id } = useParams();
  const doctorId = Number(id);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  // Регистратурата задържа часа за себе си и после го прехвърля, затова и
  // надписът е друг: „запазете“ би обещало на служителя час при зъболекар.
  const isStaff = user?.role === 'STAFF';

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selected, setSelected] = useState(null);
  const now = useNow();

  // Отговорите идват от `/triage`. Липсват само ако някой е отворил календара
  // директно — тогава го пращаме да ги даде и се връща на същия час.
  const { answers } = useTriageDraft();
  const [params] = useSearchParams();
  const wanted = params.get('slot');

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
    // `/slots/calendar` иска вход, `/slots/free` не. Затова непознат посетител
    // получава само свободните — по-малко подробно, но достатъчно, за да види
    // кога го приемат, вместо да опре в стена за вход.
    //
    // Разликата на екрана: заетите часове ги няма изобщо, тоест излизат като
    // „не се предлага“ вместо задраскани. Щом човекът влезе, ключът се сменя и
    // гридът се дозарежда с пълната картина.
    queryKey: ['slots', doctorId, from, isAuthenticated],
    queryFn: () =>
      isAuthenticated
        ? getCalendarSlots(doctorId, from, to)
        : getFreeSlots(doctorId, from, to),
  });

  // Токенът носи само имейл и роля, не и id, затова „моят час“ се разпознава по
  // резервациите, а не по `slot.patientId`. Ключът е същият като в „Моите часове“,
  // тоест обикновено идва от кеша.
  const { data: myAppointments } = useQuery({
    queryKey: ['appointments', 'me'],
    queryFn: getMyAppointments,
    enabled: isAuthenticated,
  });
  const mySlotIds = new Set((myAppointments ?? []).map((appointment) => appointment.slotId));

  // Тук провалът значи само „избери друг час“ — гридът вече е пред човека.
  const { mutate: confirm, isPending: isBooking } = useBookWithTriage({
    onConflict: () => setSelected(null),
  });

  // Три спирки преди записването, всяка от които има смисъл сама по себе си:
  // вход, ако човекът не е влязъл; въпросите, ако е стигнал дотук без тях; иначе
  // направо записваме.
  // Въпросите с вече избран час. `at` е само за показване — записва се по `slot`
  // — но човекът ще отговаря на четири въпроса и заслужава да види какво
  // потвърждава накрая.
  const questionsFor = (slot) =>
    `/triage?from=${encodeURIComponent(location.pathname)}&slot=${slot.id}&at=${slot.startTime}`;

  const book = () => {
    // Изборът не бива да се губи заради вход. Пращаме към него с адрес за
    // връщане, който вече носи часа — така след влизане човекът продължава от
    // въпросите, вместо да търси наново кой час беше избрал.
    if (!isAuthenticated) {
      navigate(`/login?from=${encodeURIComponent(questionsFor(pick))}`);
      return;
    }
    if (!answers) {
      navigate(questionsFor(pick));
      return;
    }
    confirm({ slot: pick, answers });
  };

  // Колоните се строят в `lib/slotColumns.js`, защото и прегледът преди
  // създаване на часове рисува същия грид.
  const gridDays = buildSlotColumns(
    days.map((date) => ({
      key: dayKey(date),
      weekday: formatWeekday(date, i18n.resolvedLanguage),
      label: formatDayMonth(date, i18n.resolvedLanguage),
    })),
    slots,
    (slot) => slotState(slot, isPastTime(slot.startTime), mySlotIds),
  );

  const hasFreeSlot = gridDays.some((day) =>
    day.slots.some((slot) => slot.state === 'free'),
  );

  // A slot picked a while ago can slip into the past while the page sits open.
  // `?slot=` е връщането от въпросите: човекът е избрал час, пратен е да отговори
  // и заслужава да го намери избран, а не да го търси наново.
  const fromUrl =
    wanted && !selected
      ? gridDays
          .flatMap((day) => day.slots)
          .find((slot) => String(slot.id) === wanted && slot.state === 'free')
      : null;
  const chosen = selected ?? fromUrl;
  const pick = chosen && !isPastTime(chosen.startTime) ? chosen : null;

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

      {/* Лентата се показва само на човек, който е в потока. На случаен посетител
          „Оплакване ✓“ би било лъжа. */}
      {answers && (
        <BookingSteps current={2} forStaff={isStaff} style={{ marginTop: 'var(--space-8)' }} />
      )}

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

      {/* Списъкът с лекари вече е публичен, но `/api/slots/calendar` не е — тоест
          непознат посетител стига дотук и получава 403. Казваме му го честно,
          вместо да го наречем повреда в мрежата. */}
      {isError && !isAuthenticated && <SignInRequired />}

      {isError && isAuthenticated && (
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
          <SlotGrid
            days={gridDays}
            value={pick?.id}
            onSelect={setSelected}
            legend={isAuthenticated ? LEGEND : LEGEND_PUBLIC}
            labels={{
              free: t('calendar.legendFree'),
              selected: t('calendar.legendSelected'),
              mine: t('calendar.legendMine'),
              taken: t('calendar.legendTaken'),
              blocked: t('calendar.legendBlocked'),
              // Миналият час, часът извън работното време и денят без график
              // изглеждат еднакво и значат едно и също — не може да се запази —
              // затова са под общ надпис.
              past: t('calendar.legendUnavailable'),
              none: t('calendar.legendUnavailable'),
              // Колона без нито един час, когато няма от кого да заеме стъпка —
              // цялата седмица е празна.
              empty: t('calendar.legendUnavailable'),
            }}
          />

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
                // Датата е задължителна тук: гридът показва цяла седмица и след
                // няколко превъртания „Избрахте 14:00“ не казва кой ден.
                <Trans
                  i18nKey="calendar.selected"
                  values={{
                    // Същият форматер като в заглавията на колоните, за да се
                    // сверява с един поглед коя колона е избрана.
                    date: formatDayMonth(
                      fromLocalDateTime(pick.startTime),
                      i18n.resolvedLanguage,
                    ),
                    time: pick.time,
                  }}
                  components={{ mono: <span style={mono} /> }}
                />
              ) : (
                t('calendar.pickPrompt')
              )}
            </span>
            <Button
              disabled={!pick || isBooking}
              onClick={book}
              iconLeft={<Icon name="calendar-check" size="var(--icon-sm)" />}
            >
              {isBooking
                ? t(isStaff ? 'staffBooking.holding' : 'calendar.booking')
                : t(isStaff ? 'staffBooking.hold' : 'calendar.book')}
            </Button>
          </Card>
        </>
      )}

    </PageShell>
  );
}
