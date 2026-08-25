import { request } from './client';

// The slot is in the path and the patient comes from the token, so no body.
// 201 on success, 409 if someone booked the slot first.
export const bookSlot = (slotId) =>
  request(`/appointments/book/${slotId}`, { method: 'POST' });

export const getMyAppointments = () => request('/appointments/me');

export const cancelAppointment = (id) =>
  request(`/appointments/${id}`, { method: 'DELETE' });
