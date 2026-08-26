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

// TriageRequestDto: { painLevel 1-10, painDuration, highTemperature, swelling }
// Score-ът и приоритетът се смятат на сървъра — ние пращаме само отговорите.
// Двата булеви задължително са true/false: `calculateScore` ги разопакова без
// проверка, тоест липсващо поле е 500, а не 400.
export const submitTriage = (appointmentId, answers) =>
  request(`/triage/${appointmentId}`, {
    method: 'POST',
    body: JSON.stringify(answers),
  });

export function parseAnswers(answers) {
  if (!answers) return null;
  try {
    return typeof answers === 'string' ? JSON.parse(answers) : answers;
  } catch {
    return null;
  }
}
