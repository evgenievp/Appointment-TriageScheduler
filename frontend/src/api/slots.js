import { request } from './client';

// SlotDto: { id, startTime, endTime, status, doctorId, patientId }
// status: FREE | BOOKED | BLOCKED
// Часовете са LocalDateTime без зона: "2026-08-13T09:00:00".

const query = (doctorId, from, to) =>
  new URLSearchParams({ doctorId, from, to }).toString();

export const getFreeSlots = (doctorId, from, to) =>
  request(`/slots/free?${query(doctorId, from, to)}`);

export const getCalendarSlots = (doctorId, from, to) =>
  request(`/slots/calendar?${query(doctorId, from, to)}`);

// GenerateSlotsRequest: { doctorId, startDate, endDate, workStart, workEnd, slotTime }
// Датите са "2026-08-13", часовете "09:00" — LocalDate и LocalTime, не LocalDateTime.
// `slotTime` е в минути и определя и стъпката, и дължината на слота.
//
// `preview` смята часовете, без да ги пази; `generate` записва само липсващите,
// затова връща по-малко от прегледа, когато част от тях вече съществуват.
const generateBody = (body) => ({ method: 'POST', body: JSON.stringify(body) });

export const previewSlots = (body) => request('/slots/preview', generateBody(body));

export const generateSlots = (body) => request('/slots/generate', generateBody(body));

// Смяна на продължителността: **трие периода и го прегенерира**, за разлика от
// `generate`, който само добавя липсващите. Затова се ползва тук — при смяна на
// дължината старите слотове трябва да изчезнат, иначе 30- и 45-минутни се смесват.
//
// Лекарят идва от токена, не от тялото, и всичко е в query параметри — този
// ендпойнт няма `@RequestBody`. Проверено срещу сървъра: тяло се подминава.
//
// Гърми с 500, ако в периода има запазен час — чуждият ключ от `appointment`
// спира триенето и транзакцията се връща. Данни не се губят, но операцията е
// невъзможна, докато часовете не бъдат отказани.
export const setSlotTime = (slotTime, { startDate, endDate, workStart, workEnd }) => {
  const params = new URLSearchParams({ startDate, endDate, workStart, workEnd });
  return request(`/slots/setSlotTime/${slotTime}?${params}`, { method: 'PATCH' });
};
