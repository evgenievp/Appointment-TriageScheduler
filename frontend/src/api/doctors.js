import { request } from './client';

// DoctorDto: { id, name, speciality, role }
// ВНИМАНИЕ: бекендът още няма този ендпойнт — има само /api/doctors/me.
// Поискан е от екипа; дотогава работи само срещу MSW.
export const getDoctors = () => request('/doctors');
