import { request } from './client';

// TriageResponseDto: { score, priority, answers }
// `answers` е JSON низ, не обект — колоната е jsonb, но полето в record-а е
// String, така че Jackson го праща като низ и се парсва тук.
//
// В `TriageResults` връзката към резервацията е `unique, nullable = false`,
// тоест триаж без резервация не може да съществува. Затова опашката филтрира по
// `priority` от `AppointmentDto` и вика това само за спешните — без N+1 през
// целия ден.
export const getTriageResult = (appointmentId) => request(`/triage/${appointmentId}`);

export function parseAnswers(answers) {
  if (!answers) return null;
  try {
    return typeof answers === 'string' ? JSON.parse(answers) : answers;
  } catch {
    return null;
  }
}
