// Данни за mock-овете. Огледало на бекенд `DataSeeder`: слотове по 30 минути,
// 9:00–18:00, две седмици напред. Формите на обектите следват DTO-тата от
// `backend/src/main/java/.../dto/` — не PLAN_1.md, който се разминава с кода.

const SLOT_MINUTES = 30;
const WORK_START = 9;
const WORK_END = 18;
const DAYS_AHEAD = 14;

// DoctorDto: { id, name, speciality, role }
// Внимание: полето е "speciality", не "specialty".
export const doctors = [
  { id: 1, name: 'Д-р Иванов', speciality: 'Стоматология', role: 'DOCTOR' },
  { id: 2, name: 'Д-р Ана Фарер', speciality: 'Кардиология', role: 'DOCTOR' },
  { id: 3, name: 'Д-р Мартин Лунд', speciality: 'Обща медицина', role: 'DOCTOR' },
  { id: 4, name: 'Д-р Ирина Колева', speciality: 'Ортопедия', role: 'DOCTOR' },
];

// Бекендът връща LocalDateTime без часова зона: "2026-08-13T09:00:00".
export function toLocalDateTime(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
  );
}

// SlotDto: { id, startTime, endTime, status, doctorId, patientId }
function buildSlots() {
  const slots = [];
  let id = 1;
  const day = new Date();
  day.setHours(0, 0, 0, 0);

  for (let d = 0; d < DAYS_AHEAD; d++) {
    for (let minutes = WORK_START * 60; minutes < WORK_END * 60; minutes += SLOT_MINUTES) {
      const start = new Date(day);
      start.setDate(day.getDate() + d);
      start.setMinutes(minutes);
      const end = new Date(start.getTime() + SLOT_MINUTES * 60_000);

      slots.push({
        id: id++,
        startTime: toLocalDateTime(start),
        endTime: toLocalDateTime(end),
        // Малко заети часове, за да не е гридът подозрително празен.
        status: id % 7 === 0 ? 'BOOKED' : 'FREE',
        doctorId: doctors[d % doctors.length].id,
        patientId: null,
      });
    }
  }
  return slots;
}

// Всеки лекар получава пълен график, не само през ден.
export const slots = doctors.flatMap((doctor) =>
  buildSlots().map((slot, i) => ({
    ...slot,
    id: slot.id * 10 + doctor.id,
    doctorId: doctor.id,
    status: (i + doctor.id) % 7 === 0 ? 'BOOKED' : 'FREE',
  })),
);

export const appointments = [];

// AppointmentDto as the backend returns it, plus the two names it does not send
// — without those the doctor and staff lists can only show ids.
// The id field is `appointmentId`; only SlotDto uses a bare `id`.
export function toAppointmentDto(appointment) {
  const patient = users.find((u) => u.id === appointment.patientId);

  return {
    appointmentId: appointment.id,
    slotId: appointment.slotId,
    patientId: appointment.patientId,
    // Контактните полета бият релацията. При нерегистриран пациент часът стои на
    // служителя — `patient_id` е `nullable = false` — но списъците трябва да
    // показват човека, който ще дойде, не онзи, който е вдигнал телефона.
    patientName: appointment.contactName ?? patient?.name ?? null,
    patientPhone: appointment.contactPhone ?? patient?.phone ?? null,
    doctorId: appointment.doctorId,
    doctorName: doctors.find((d) => d.id === appointment.doctorId)?.name ?? null,
    appointmentTime: appointment.appointmentTime,
    status: appointment.status,
    notes: appointment.notes ?? null,
    priority: appointment.priority ?? 'NORMAL',
  };
}

let nextAppointmentId = 1;
export const nextId = () => nextAppointmentId++;

let nextSlotIdValue = Math.max(...slots.map((s) => s.id)) + 1;
export const nextSlotId = () => nextSlotIdValue++;

// ExceptionDayDto: { id, date, reason, doctor }. reason: HOLIDAY | RESTDAY.
export const exceptionDays = [];

let nextExceptionIdValue = 1;
export const nextExceptionId = () => nextExceptionIdValue++;

// Booked visits spread over two patients, three doctors and three days, so the
// three lists actually differ: the patient sees their own, the doctor sees their
// column, the staff sees one day at a time and can page through them.
// Огледало на `TriageService.calculateScore`: 0–10, URGENT при 5 и нагоре.
export function triageScore({ painLevel, painDuration, highTemperature, swelling }) {
  const pain = painLevel >= 9 ? 3 : painLevel >= 7 ? 2 : painLevel >= 4 ? 1 : 0;
  const duration =
    { THREE_DAYS: 1, ONE_WEEK: 2, MORE_THAN_WEEK: 3 }[painDuration] ?? 0;
  return pain + duration + (highTemperature ? 2 : 0) + (swelling ? 2 : 0);
}

const dayStamp = (offset) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return toLocalDateTime(date).slice(0, 10);
};

// TriageResults: { appointmentId, score, priority, answers }. Връзката към
// резервацията е `unique, nullable = false` в бекенда — триаж без резервация не
// може да съществува, затова тук се пазят по appointmentId.
export const triageResults = [];

[
  {
    patientId: 1,
    doctorId: 1,
    day: 0,
    // Попълнен триаж, но слаб: болка 3 → 0, под ден → 0. Общо 0, значи NORMAL.
    // Стои тук нарочно — опашката филтрира по приоритет, не по „има ли триаж“.
    triage: {
      painLevel: 3,
      painDuration: 'LESS_THAN_DAY',
      highTemperature: false,
      swelling: false,
    },
  },
  { patientId: 1, doctorId: 2, day: 0 },

  // Един натоварен ден, за да има какво да превърта таблото на персонала.
  { patientId: 4, doctorId: 1, day: 1, time: '09:00' },
  { patientId: 1, doctorId: 2, day: 1, time: '09:30' },
  { patientId: 4, doctorId: 4, day: 1, time: '10:00' },
  { patientId: 1, doctorId: 1, day: 1, time: '10:30' },
  { patientId: 4, doctorId: 2, day: 1, time: '11:00' },
  { patientId: 1, doctorId: 4, day: 1, time: '11:30' },
  { patientId: 4, doctorId: 1, day: 1, time: '13:00' },
  { patientId: 1, doctorId: 2, day: 1, time: '14:00' },
  { patientId: 4, doctorId: 4, day: 1, time: '15:00' },
  {
    patientId: 4,
    doctorId: 3,
    day: 1,
    // Нарочно късно през деня: спешният случай е далеч надолу в списъка, така че
    // се вижда дали превъртането от опашката работи.
    time: '16:00',
    // Точките са по правилата на `TriageService`: болка 9 → 3, над седмица → 3,
    // температура → 2. Общо 8, а праг за URGENT е 5.
    triage: {
      painLevel: 9,
      painDuration: 'MORE_THAN_WEEK',
      highTemperature: true,
      swelling: false,
    },
  },
  { patientId: 1, doctorId: 1, day: 1, time: '16:30' },
  {
    patientId: 1,
    doctorId: 2,
    day: 2,
    // Болка 7 → 2, седмица → 2, подуване → 2. Общо 6, тоест URGENT, но по-нисък
    // от другия — така се вижда, че опашката ги подрежда, а не просто ги изброява.
    triage: {
      painLevel: 7,
      painDuration: 'ONE_WEEK',
      highTemperature: false,
      swelling: true,
    },
  },
].forEach(({ patientId, doctorId, day, time, triage }) => {
  const stamp = dayStamp(day);
  const free = slots.filter(
    (s) => s.doctorId === doctorId && s.status === 'FREE' && s.startTime.startsWith(stamp),
  );
  // `time` е предпочитание, не изискване: част от слотовете са заети още при
  // раждането им, а сравнението на "HH:MM" като низове върши работа.
  const slot = (time && free.find((s) => s.startTime.slice(11, 16) >= time)) || free[0];
  if (!slot) return;
  slot.status = 'BOOKED';
  slot.patientId = patientId;

  const id = nextId();
  const score = triage ? triageScore(triage) : null;
  const priority = score == null ? 'NORMAL' : score >= 5 ? 'URGENT' : 'NORMAL';

  appointments.push({
    id,
    slotId: slot.id,
    patientId,
    doctorId,
    appointmentTime: slot.startTime,
    status: 'CONFIRMED',
    notes: null,
    priority,
  });

  if (triage) {
    // `answers` идва като JSON низ, не като обект — колоната е jsonb, но полето
    // в record-а е String, така че Jackson го праща така.
    triageResults.push({
      appointmentId: id,
      score,
      priority,
      answers: JSON.stringify(triage),
    });
  }
});

// Потребители за mock-натата автентикация. Паролите стоят в чист вид нарочно —
// това е mock, не се доближава до нищо истинско.
// Телефоните са E.164, както ги праща формата за регистрация. Търсенето на
// пациент е точно съвпадение, тоест всеки друг запис просто не се намира.
export const users = [
  {
    id: 1,
    email: 'maria@example.bg',
    password: 'sirma2026',
    name: 'Мария Илиева',
    phone: '+359881234567',
    role: 'PATIENT',
  },
  {
    id: 2,
    email: 'staff@example.bg',
    password: 'sirma2026',
    name: 'Регистратура',
    phone: '+35929000000',
    role: 'STAFF',
  },
  // The backend cannot create a doctor account — registration always makes a
  // PATIENT — so the doctor view is only testable against the mocks.
  {
    id: 3,
    email: 'doctor@example.bg',
    password: 'sirma2026',
    name: 'Д-р Иванов',
    phone: '+35929000001',
    role: 'DOCTOR',
    doctorId: 1,
  },
  {
    id: 4,
    email: 'ivan@example.bg',
    password: 'sirma2026',
    name: 'Иван Петров',
    phone: '+359885551234',
    role: 'PATIENT',
  },
];

const base64url = (value) =>
  btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

// Истински по форма, но неподписан JWT. Фронтендът само чете payload-а и никога
// не проверява подписа, така че се държи като този от бекенда: { sub, role, iat, exp }.
export function fakeToken(user) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'HS512', typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({
      sub: user.email,
      role: user.role,
      iat: issuedAt,
      exp: issuedAt + 60 * 60, // час, както при бекенда
    }),
  );
  return `${header}.${payload}.mock-signature`;
}
