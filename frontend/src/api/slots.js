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

// GenerateSlotsRequest: { doctorId, startDate, endDate, workStart, workEnd }
// Датите са "2026-08-13", часовете "09:00" — LocalDate и LocalTime, не LocalDateTime.
// `preview` смята часовете, без да ги пази; `generate` записва само липсващите,
// затова връща по-малко от прегледа, когато част от тях вече съществуват.
const generateBody = (body) => ({ method: 'POST', body: JSON.stringify(body) });

export const previewSlots = (body) => request('/slots/preview', generateBody(body));

export const generateSlots = (body) => request('/slots/generate', generateBody(body));
