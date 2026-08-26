import { request } from './client';

// DoctorDto: { id, name, speciality, role }
// ВНИМАНИЕ: бекендът още няма този ендпойнт — има само /api/doctors/me.
// Поискан е от екипа; дотогава работи само срещу MSW.
export const getDoctors = () => request('/doctors');

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
