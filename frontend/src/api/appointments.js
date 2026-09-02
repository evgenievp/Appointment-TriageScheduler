import { request } from './client';

// The slot is in the path and the patient comes from the token, so no body.
// 201 on success, 409 if someone booked the slot first.
export const bookSlot = (slotId) =>
  request(`/appointments/book/${slotId}`, { method: 'POST' });

export const getMyAppointments = () => request('/appointments/me');

// Часовете на влезлия лекар. Живее при лекарите, не при резервациите — беше
// `/appointments/doctor/me`, но онзи път вече не съществува.
export const getDoctorAppointments = () => request('/doctors/me/doctor');

// Всички резервации, без филтър по ден — филтрирането е при викащия.
//
// Има и ендпойнт за един ден, но той страда от същия удвоен префикс. Този тук е
// на правилния адрес и няма да се промени, когато онзи се оправи. При клиника с
// няколко десетки часа разликата в трафика е без значение, а опашката със
// спешните така или иначе иска всички дни наведнъж.
export const getStaffAppointments = () => request('/staff/all');

export const cancelAppointment = (id) =>
  request(`/appointments/${id}`, { method: 'DELETE' });

// AppointmentDto with the new slot, time and doctor. The row keeps its id, so
// the triage and the priority survive the move; the old slot is freed.
// 409 if the new slot was taken first, 403 unless the caller owns the visit —
// reception cannot move a patient's visit yet.
export const rescheduleAppointment = (appointmentId, newSlotId) =>
  request(`/appointments/${appointmentId}/reschedule/${newSlotId}`, { method: 'PATCH' });
