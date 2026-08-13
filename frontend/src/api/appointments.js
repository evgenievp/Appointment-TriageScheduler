import { request } from './client';

// Записването е POST без тяло — слотът е в пътя, пациентът идва от токена.
// 201 при успех, 409 с code "SLOT_TAKEN", ако някой е взел часа преди нас.
export const bookSlot = (slotId) =>
  request(`/appointments/book/${slotId}`, { method: 'POST' });

export const getMyAppointments = () => request('/appointments/me');

export const cancelAppointment = (id) =>
  request(`/appointments/${id}`, { method: 'DELETE' });
