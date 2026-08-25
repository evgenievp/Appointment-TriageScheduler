import { http, HttpResponse, delay } from 'msw';
import {
  doctors,
  slots,
  appointments,
  users,
  fakeToken,
  toLocalDateTime,
} from './data';

// Mock-овете следват контракта на бекенда (`backend/README_BACKEND.md` + DTO-тата).
// Две съзнателни разминавания със сегашния код на бекенда, отбелязани на място:
// GET /api/doctors още не съществува, а конфликтът при записване днес се връща
// като 500 вместо договорения 409.

const API = 'http://localhost:8081';
const LATENCY = 300; // за да се виждат loading състоянията

// Пътищата се вдигат и относително (/api/...), и към бекенд адреса, за да работят
// и през Vite proxy-то, и при директна заявка.
const route = (path) => [`${API}${path}`, path];
const handle = (method, path, resolver) =>
  route(path).map((url) => http[method](url, resolver));

const inRange = (slot, from, to) =>
  (!from || slot.startTime >= from) && (!to || slot.startTime <= to);

// The real backend rejects an unknown token with 401; the mocks have to do the
// same, otherwise the expired-session path is untestable.
function userFromRequest(request) {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const [, payload] = header.slice(7).split('.');
    const { sub } = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    );
    return users.find((u) => u.email === sub) ?? null;
  } catch {
    return null;
  }
}

const unauthorized = () => new HttpResponse('Unauthorized', { status: 401 });

function querySlots(request, onlyFree) {
  const url = new URL(request.url);
  const doctorId = Number(url.searchParams.get('doctorId'));
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  return slots.filter(
    (s) =>
      s.doctorId === doctorId &&
      inRange(s, from, to) &&
      (!onlyFree || s.status === 'FREE'),
  );
}

export const handlers = [
  // --- Автентикация ---------------------------------------------------
  // Грешките тук са обикновен текст, а не JSON — точно както ги връща
  // `GlobalExceptionHandler` на бекенда. Ако утре минат на { code, message },
  // клиентът вече разбира и двете.
  ...handle('post', '/api/auth/register', async ({ request }) => {
    await delay(LATENCY);
    const data = await request.json();

    if (users.some((u) => u.email === data.email)) {
      return new HttpResponse('Email already registered!', { status: 409 });
    }

    const user = {
      id: users.length + 1,
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone,
      role: 'PATIENT',
    };
    users.push(user);

    // UserDto: { id, name, phone, email } — без паролата и без ролята.
    return HttpResponse.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
    });
  }),

  ...handle('post', '/api/auth/login', async ({ request }) => {
    await delay(LATENCY);
    const { email, password } = await request.json();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      return new HttpResponse('Invalid email or password', { status: 401 });
    }

    return HttpResponse.json({ token: fakeToken(user) });
  }),

  // TODO: този ендпойнт го няма в бекенда — има само /api/doctors/me.
  // Поискан е от екипа; ако решат друг път, се сменя само тук и в api/doctors.js.
  ...handle('get', '/api/doctors', async () => {
    await delay(LATENCY);
    return HttpResponse.json(doctors);
  }),

  ...handle('get', '/api/slots/free', async ({ request }) => {
    await delay(LATENCY);
    return HttpResponse.json(querySlots(request, true));
  }),

  ...handle('get', '/api/slots/calendar', async ({ request }) => {
    await delay(LATENCY);
    return HttpResponse.json(querySlots(request, false));
  }),

  ...handle('post', '/api/appointments/book/:slotId', async ({ request, params }) => {
    await delay(LATENCY);
    const user = userFromRequest(request);
    if (!user) return unauthorized();

    const slot = slots.find((s) => s.id === Number(params.slotId));

    if (!slot) {
      return new HttpResponse('Slot not found', { status: 404 });
    }

    // The heart of the assignment. The backend currently throws a bare
    // RuntimeException here and answers 500; 409 is what the team agreed on.
    if (slot.status !== 'FREE') {
      return new HttpResponse('Slot already booked', { status: 409 });
    }

    slot.status = 'BOOKED';
    slot.patientId = 1;

    const appointment = {
      slotId: slot.id,
      patientId: 1,
      doctorId: slot.doctorId,
      appointmentTime: slot.startTime,
      status: 'BOOKED',
      notes: null,
    };
    appointments.push(appointment);

    return HttpResponse.json(appointment, { status: 201 });
  }),

  ...handle('get', '/api/appointments/me', async ({ request }) => {
    if (!userFromRequest(request)) return unauthorized();
    await delay(LATENCY);
    return HttpResponse.json(appointments);
  }),

  ...handle('delete', '/api/appointments/:id', async ({ request, params }) => {
    if (!userFromRequest(request)) return unauthorized();
    await delay(LATENCY);
    const index = appointments.findIndex((a) => a.slotId === Number(params.id));
    if (index === -1) return new HttpResponse(null, { status: 404 });

    const slot = slots.find((s) => s.id === appointments[index].slotId);
    if (slot) {
      slot.status = 'FREE';
      slot.patientId = null;
    }
    appointments.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];

// Помощно за демото на 409: заема слот „зад гърба“ на потребителя, все едно
// друг браузър го е взел секунда преди това.
export function takeSlotBehindTheScenes(slotId) {
  const slot = slots.find((s) => s.id === Number(slotId));
  if (slot) slot.status = 'BOOKED';
}

export { toLocalDateTime };
