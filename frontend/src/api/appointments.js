import { request } from './client';

// The slot is in the path and the patient comes from the token, so no body.
// 201 on success, 409 if someone booked the slot first.
export const bookSlot = (slotId) =>
  request(`/appointments/book/${slotId}`, { method: 'POST' });

export const getMyAppointments = () => request('/appointments/me');

// Съществува, но на удвоен път: `@GetMapping` повтаря префикса на класа, тоест
// работещият адрес в момента е `/api/appointments/api/appointments/doctor/me`.
// Не го викаме така — ще се оправи и ще трябва да се пипа втори път.
export const getDoctorAppointments = () => request('/appointments/doctor/me');

// Всички резервации, без филтър по ден — филтрирането е при викащия.
//
// Има и ендпойнт за един ден, но той страда от същия удвоен префикс. Този тук е
// на правилния адрес и няма да се промени, когато онзи се оправи. При клиника с
// няколко десетки часа разликата в трафика е без значение, а опашката със
// спешните така или иначе иска всички дни наведнъж.
export const getStaffAppointments = () => request('/staff/all');

export const cancelAppointment = (id) =>
  request(`/appointments/${id}`, { method: 'DELETE' });
