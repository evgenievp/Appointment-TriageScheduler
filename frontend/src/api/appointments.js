import { request } from './client';

// The slot is in the path and the patient comes from the token, so no body.
// 201 on success, 409 if someone booked the slot first.
export const bookSlot = (slotId) =>
  request(`/appointments/book/${slotId}`, { method: 'POST' });

export const getMyAppointments = () => request('/appointments/me');

// Neither of these exists on the backend yet; the repository already has
// findByDoctorId, so both are a controller method away. Mocked for now.
export const getDoctorAppointments = () => request('/appointments/doctor/me');

// Без `date` връща всичко — така опашката със спешните вижда отвъд избрания ден.
export const getStaffAppointments = (date) =>
  request(`/staff/appointments${date ? `?date=${date}` : ''}`);

export const cancelAppointment = (id) =>
  request(`/appointments/${id}`, { method: 'DELETE' });
