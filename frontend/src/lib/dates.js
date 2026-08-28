// Работа с дати за календара. Бекендът праща и приема `LocalDateTime` без
// часова зона ("2026-08-13T09:00:00"), затова всичко тук е в местно време и
// никъде не се появява `Z` или отместване.

const pad = (n) => String(n).padStart(2, '0');

/** Дата → "2026-08-13T09:00:00", форматът, който чака бекендът. */
export function toLocalDateTime(date) {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
  );
}

/** Дата → "2026-08-13", форматът на `<input type="date">` и на `LocalDate`. */
export const toDateInput = (date) => toLocalDateTime(date).slice(0, 10);

/** "2026-08-13" + 1 → "2026-08-14". Прескача коректно месеци и лятно време. */
export const shiftDateInput = (value, days) =>
  toDateInput(addDays(new Date(`${value}T00:00:00`), days));

/** "2026-08-13T09:00:00" → Date. `new Date(...)` се справя, но явно е по-ясно. */
export function fromLocalDateTime(value) {
  const [date, time] = value.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Понеделникът на седмицата, в която попада датата. */
export function startOfWeek(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const weekday = (start.getDay() + 6) % 7; // 0 = понеделник
  return addDays(start, -weekday);
}

export function endOfDay(date) {
  const end = new Date(date);
  end.setHours(23, 59, 59, 0);
  return end;
}

export const weekDays = (weekStart) =>
  Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

export const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** "пн" / "Mon" — според избрания език. */
/** Нативните полета за дата изпразват `value`, докато датата е непълна — един
 *  клавиш в годината стига. Тогава `new Date('T00:00:00')` е Invalid Date, а
 *  `Intl` хвърля `Invalid time value` и сваля целия екран в ErrorBoundary.
 *  Затова форматиращите се държат тихо: липсваща дата е тире, не срив. */
const isValidDate = (date) => date instanceof Date && !Number.isNaN(date.getTime());
const NO_DATE = '—';

export const formatWeekday = (date, locale) =>
  isValidDate(date)
    ? new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date)
    : NO_DATE;

/** "13.08" / "13/08" — според избрания език. */
export const formatDayMonth = (date, locale) =>
  isValidDate(date)
    ? new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(date)
    : NO_DATE;

/** "26 АВГ" / "26 AUG" — датата в AppointmentRow.
 *  Сглобява се на ръка: `month: 'short'` дава "26.08" на български, без име на
 *  месец. Отрязването до три букви е вярно и за двата ни езика (ЯНУ ФЕВ МАР…,
 *  JAN FEB MAR…); при добавяне на трети език се проверява наново. */
export const formatDayShort = (date, locale) => {
  if (!isValidDate(date)) return NO_DATE;
  const day = new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(date);
  const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
  return `${day} ${month.slice(0, 3).toUpperCase()}`;
};

/** "13 август" / "13 August" — за заглавието на седмицата. */
export const formatDayLong = (date, locale) =>
  isValidDate(date)
    ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(date)
    : NO_DATE;

export const formatTime = (date, locale) =>
  isValidDate(date)
    ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date)
    : NO_DATE;
