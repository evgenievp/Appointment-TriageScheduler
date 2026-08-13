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
