import { request } from './client';

// DoctorDto: { id, name, speciality, role }
// Единственият публичен път към списъка: `/api/doctors` изисква вход, а
// `/allDoctors` е `permitAll` — така непознат посетител вижда кой приема,
// преди да се регистрира.
export const getDoctors = () => request('/doctors/allDoctors');

// Единственият начин лекарят да научи своето doctorId — токенът носи само роля.
export const getCurrentDoctor = () => request('/doctors/me');

// ExceptionDayDto: { id, date, reason, doctor }
// reason: HOLIDAY | RESTDAY. `doctor` се връща от сървъра, но при създаване се
// подава само { date, reason } — `addExceptionDay` игнорира останалото и взима
// лекаря от токена.
export const getMyExceptions = () => request('/doctors/me/exceptions');

export const addException = (day) =>
  request('/doctors/me/exceptions', { method: 'POST', body: JSON.stringify(day) });

export const deleteException = (id) =>
  request(`/doctors/me/exceptions/${id}`, { method: 'DELETE' });
