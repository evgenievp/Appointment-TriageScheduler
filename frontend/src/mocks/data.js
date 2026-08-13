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
