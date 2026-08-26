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
  return {
    appointmentId: appointment.id,
    slotId: appointment.slotId,
    patientId: appointment.patientId,
    patientName: users.find((u) => u.id === appointment.patientId)?.name ?? null,
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
const dayStamp = (offset) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return toLocalDateTime(date).slice(0, 10);
};

[
  { patientId: 1, doctorId: 1, day: 0 },
  { patientId: 1, doctorId: 2, day: 0 },
  { patientId: 4, doctorId: 1, day: 1 },
  { patientId: 4, doctorId: 3, day: 1 },
  { patientId: 1, doctorId: 2, day: 2 },
].forEach(({ patientId, doctorId, day }) => {
  const stamp = dayStamp(day);
  const slot = slots.find(
    (s) => s.doctorId === doctorId && s.status === 'FREE' && s.startTime.startsWith(stamp),
  );
  if (!slot) return;
  slot.status = 'BOOKED';
  slot.patientId = patientId;
  appointments.push({
    id: nextId(),
    slotId: slot.id,
    patientId,
    doctorId,
    appointmentTime: slot.startTime,
    status: 'CONFIRMED',
    notes: null,
  });
});

// Потребители за mock-натата автентикация. Паролите стоят в чист вид нарочно —
// това е mock, не се доближава до нищо истинско.
export const users = [
  {
    id: 1,
    email: 'maria@example.bg',
    password: 'sirma2026',
    name: 'Мария Илиева',
    phone: '+359 88 123 4567',
    role: 'PATIENT',
  },
  {
    id: 2,
    email: 'staff@example.bg',
    password: 'sirma2026',
    name: 'Регистратура',
    phone: '+359 2 900 0000',
    role: 'STAFF',
  },
  // The backend cannot create a doctor account — registration always makes a
  // PATIENT — so the doctor view is only testable against the mocks.
  {
    id: 3,
    email: 'doctor@example.bg',
    password: 'sirma2026',
    name: 'Д-р Иванов',
    phone: '+359 2 900 0001',
    role: 'DOCTOR',
    doctorId: 1,
  },
  {
    id: 4,
    email: 'ivan@example.bg',
    password: 'sirma2026',
    name: 'Иван Петров',
    phone: '+359 88 555 1234',
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
