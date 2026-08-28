import { http, HttpResponse, delay } from 'msw';
import {
  doctors,
  slots,
  appointments,
  exceptionDays,
  triageResults,
  users,
  fakeToken,
  nextId,
  nextSlotId,
  nextExceptionId,
  triageScore,
  toAppointmentDto,
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

// Огледало на `SlotsService.previewSlots`: слотове по 30 минути, събота и неделя
// се пропускат, 12:00–13:00 също (обедната почивка е поле на самия service —
// обща за всички лекари и нередактируема отвън, затова е константа и тук),
// а също и почивните дни на лекаря.
const SLOT_MINUTES = 30;
const REST_START = '12:00';
const REST_END = '13:00';

const minutesOf = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const toDateOnly = (date) => toLocalDateTime(date).slice(0, 10);

function plannedSlots({ doctorId, startDate, endDate, workStart, workEnd }) {
  const planned = [];
  const day = new Date(`${startDate}T00:00:00`);
  const last = new Date(`${endDate}T00:00:00`);
  const from = minutesOf(workStart);
  const to = minutesOf(workEnd);
  const off = new Set(
    exceptionDays.filter((e) => e.doctor?.id === doctorId).map((e) => e.date),
  );

  while (day <= last) {
    if (day.getDay() !== 0 && day.getDay() !== 6 && !off.has(toDateOnly(day))) {
      for (let m = from; m + SLOT_MINUTES <= to; m += SLOT_MINUTES) {
        const start = new Date(day);
        start.setHours(0, m, 0, 0);
        const time = toLocalDateTime(start).slice(11, 16);
        if (time >= REST_START && time < REST_END) continue;

        planned.push({
          id: null,
          startTime: toLocalDateTime(start),
          endTime: toLocalDateTime(new Date(start.getTime() + SLOT_MINUTES * 60_000)),
          status: 'FREE',
          doctorId,
          patientId: null,
        });
      }
    }
    day.setDate(day.getDate() + 1);
  }
  return planned;
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

  // Публичен по същия начин като в бекенда — без проверка за токен. Пътят е
  // `/allDoctors`, защото голото `/api/doctors` там иска вход.
  ...handle('get', '/api/doctors/allDoctors', async () => {
    await delay(LATENCY);
    return HttpResponse.json(doctors);
  }),

  ...handle('get', '/api/doctors/me', async ({ request }) => {
    const user = userFromRequest(request);
    if (!user) return unauthorized();
    if (user.role !== 'DOCTOR') return new HttpResponse('Forbidden', { status: 403 });
    await delay(LATENCY);
    return HttpResponse.json(doctors.find((d) => d.id === user.doctorId));
  }),

  // `/api/doctors/me/exceptions` не се хваща от `requestMatchers("/api/doctors/me")`
  // — този шаблон е точно съвпадение, без под-пътища — така че в бекенда трите
  // остават само `authenticated()`. И `deleteExceptionDay(id)` трие по id, без да
  // гледа чий е денят. Тук е мокнато договореното: само DOCTOR, и то за себе си.
  ...handle('get', '/api/doctors/me/exceptions', async ({ request }) => {
    const user = userFromRequest(request);
    if (!user) return unauthorized();
    if (user.role !== 'DOCTOR') return new HttpResponse('Forbidden', { status: 403 });
    await delay(LATENCY);
    return HttpResponse.json(
      exceptionDays.filter((e) => e.doctor?.id === user.doctorId),
    );
  }),

  ...handle('post', '/api/doctors/me/exceptions', async ({ request }) => {
    const user = userFromRequest(request);
    if (!user) return unauthorized();
    if (user.role !== 'DOCTOR') return new HttpResponse('Forbidden', { status: 403 });
    await delay(LATENCY);

    const { date, reason } = await request.json();
    const day = {
      id: nextExceptionId(),
      date,
      reason,
      doctor: doctors.find((d) => d.id === user.doctorId),
    };
    exceptionDays.push(day);
    return HttpResponse.json(day, { status: 201 });
  }),

  ...handle('delete', '/api/doctors/me/exceptions/:id', async ({ request, params }) => {
    const user = userFromRequest(request);
    if (!user) return unauthorized();
    if (user.role !== 'DOCTOR') return new HttpResponse('Forbidden', { status: 403 });
    await delay(LATENCY);

    const index = exceptionDays.findIndex((e) => e.id === Number(params.id));
    if (index === -1) return new HttpResponse(null, { status: 404 });
    exceptionDays.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // Бекендът пази тези два зад `anyRequest().authenticated()` и взима doctorId от
  // тялото — тоест всеки пациент може да генерира часове на чужд лекар. Тук е
  // мокнато договореното: само DOCTOR, и то за себе си.
  ...handle('post', '/api/slots/preview', async ({ request }) => {
    const user = userFromRequest(request);
    if (!user) return unauthorized();
    if (user.role !== 'DOCTOR') return new HttpResponse('Forbidden', { status: 403 });
    await delay(LATENCY);
    return HttpResponse.json(plannedSlots(await request.json()));
  }),

  ...handle('post', '/api/slots/generate', async ({ request }) => {
    const user = userFromRequest(request);
    if (!user) return unauthorized();
    if (user.role !== 'DOCTOR') return new HttpResponse('Forbidden', { status: 403 });
    await delay(LATENCY);

    // existsByDoctorAndStartsAt: съществуващият час не се пипа и не се връща.
    const created = plannedSlots(await request.json())
      .filter(
        (planned) =>
          !slots.some(
            (s) => s.doctorId === planned.doctorId && s.startTime === planned.startTime,
          ),
      )
      .map((planned) => ({ ...planned, id: nextSlotId() }));

    slots.push(...created);
    return HttpResponse.json(created);
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
    slot.patientId = user.id;

    const appointment = {
      id: nextId(),
      slotId: slot.id,
      patientId: user.id,
      doctorId: slot.doctorId,
      appointmentTime: slot.startTime,
      status: 'CONFIRMED',
      notes: null,
      // The backend books everything as NORMAL; triage is what raises it.
      priority: 'NORMAL',
    };
    appointments.push(appointment);

    return HttpResponse.json(toAppointmentDto(appointment), { status: 201 });
  }),

  ...handle('get', '/api/appointments/me', async ({ request }) => {
    const user = userFromRequest(request);
    if (!user) return unauthorized();
    await delay(LATENCY);
    return HttpResponse.json(
      appointments.filter((a) => a.patientId === user.id).map(toAppointmentDto),
    );
  }),

  // Neither of the next two exists on the backend. `findByDoctorId` is already
  // in the repository, so the doctor one is a controller method away; the staff
  // one is findAll() with a date filter.
  ...handle('get', '/api/appointments/doctor/me', async ({ request }) => {
    const user = userFromRequest(request);
    if (!user) return unauthorized();
    if (user.role !== 'DOCTOR') return new HttpResponse('Forbidden', { status: 403 });
    await delay(LATENCY);
    return HttpResponse.json(
      appointments.filter((a) => a.doctorId === user.doctorId).map(toAppointmentDto),
    );
  }),

  ...handle('get', '/api/staff/appointments', async ({ request }) => {
    const user = userFromRequest(request);
    if (!user) return unauthorized();
    if (user.role !== 'STAFF') return new HttpResponse('Forbidden', { status: 403 });
    await delay(LATENCY);

    const date = new URL(request.url).searchParams.get('date');
    const onDate = date
      ? appointments.filter((a) => a.appointmentTime.startsWith(date))
      : appointments;

    return HttpResponse.json(
      [...onDate]
        .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
        .map(toAppointmentDto),
    );
  }),

  // Търсене на пациент по телефон — точно съвпадение върху E.164. Връща един
  // UserDto, не списък: съвпадението е точно, значи резултатът е най-много един.
  //
  // Разминаване с бекенда, оставено нарочно: там ненамерен идва като 500, защото
  // `findSlotByUserPhone` хвърля `EntityNotFoundException`. Тук е 404, както се
  // иска от тях. За викащия няма разлика — и двете са грешка.
  ...handle('get', '/api/staff/patient/:phone', async ({ request, params }) => {
    const user = userFromRequest(request);
    if (!user) return unauthorized();
    if (user.role !== 'STAFF') return new HttpResponse('Forbidden', { status: 403 });
    await delay(LATENCY);

    const phone = decodeURIComponent(params.phone);
    const found = users.find((u) => u.role === 'PATIENT' && u.phone === phone);
    if (!found) return new HttpResponse('No such user', { status: 404 });

    return HttpResponse.json({
      id: found.id,
      name: found.name,
      phone: found.phone,
      email: found.email,
    });
  }),

  // Прехвърляне на задържания час. Пациентът идва като `?phone=`, не в тялото —
  // сървърът го търси наново, вместо да приеме ид-то, което търсенето вече е
  // върнало. Затова непознат номер е грешка: пациент без профил още не се
  // поддържа, макар полетата за име и телефон да съществуват.
  ...handle('put', '/api/staff/slots/:slotId/assign', async ({ request, params }) => {
    const user = userFromRequest(request);
    if (!user) return unauthorized();
    if (user.role !== 'STAFF') return new HttpResponse('Forbidden', { status: 403 });
    await delay(LATENCY);

    const slotId = Number(params.slotId);
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return new HttpResponse('No such slot', { status: 404 });

    const appointment = appointments.find((a) => a.slotId === slotId);
    if (!appointment) return new HttpResponse('Slot is not booked', { status: 404 });

    const phone = new URL(request.url).searchParams.get('phone');
    const patient = users.find((u) => u.phone === phone);
    if (!patient) return new HttpResponse('No such user', { status: 404 });

    // Резервацията се мести, не се пресъздава: id-то, триажът и приоритетът
    // остават. Името и телефонът се обновяват заедно с пациента — иначе часът
    // продължава да носи името на служителя.
    slot.patientId = patient.id;
    appointment.patientId = patient.id;
    appointment.patientName = patient.name;
    appointment.patientPhone = patient.phone;

    return HttpResponse.json({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
      doctorId: slot.doctorId,
      patientId: slot.patientId,
    });
  }),

  ...handle('post', '/api/triage/:appointmentId', async ({ request, params }) => {
    const user = userFromRequest(request);
    if (!user) return unauthorized();
    await delay(LATENCY);

    const appointment = appointments.find(
      (a) => a.id === Number(params.appointmentId),
    );
    if (!appointment) {
      return new HttpResponse('Appointment not found', { status: 404 });
    }
    // `submitTriage` пуска само пациента на този час, никого другиго.
    if (appointment.patientId !== user.id) {
      return new HttpResponse(
        'You are not authorized to submit triage for this appointment',
        { status: 403 },
      );
    }

    const answers = await request.json();
    // `@Valid` на контролера: painLevel е @Min(1) @Max(10), painDuration @NotNull.
    if (
      !(answers.painLevel >= 1 && answers.painLevel <= 10) ||
      !answers.painDuration
    ) {
      return new HttpResponse('Validation failed', { status: 400 });
    }

    const score = triageScore(answers);
    const priority = score >= 5 ? 'URGENT' : 'NORMAL';

    // Един триаж на резервация — колоната е unique в бекенда.
    const existing = triageResults.findIndex(
      (r) => r.appointmentId === appointment.id,
    );
    const result = {
      appointmentId: appointment.id,
      score,
      priority,
      answers: JSON.stringify(answers),
    };
    if (existing === -1) triageResults.push(result);
    else triageResults[existing] = result;

    // `submitTriage` вдига и приоритета на самата резервация.
    appointment.priority = priority;

    return HttpResponse.json({ score, priority, answers: result.answers }, { status: 201 });
  }),

  // `getTriageResult` в бекенда няма никаква проверка — нито роля, нито чий е
  // часът. Тук е мокнато договореното: само влязъл потребител.
  ...handle('get', '/api/triage/:appointmentId', async ({ request, params }) => {
    if (!userFromRequest(request)) return unauthorized();
    await delay(LATENCY);

    const result = triageResults.find(
      (r) => r.appointmentId === Number(params.appointmentId),
    );
    if (!result) {
      return new HttpResponse('No triage result for this appointment', { status: 404 });
    }

    // TriageResponseDto: { score, priority, answers } — без appointmentId.
    return HttpResponse.json({
      score: result.score,
      priority: result.priority,
      answers: result.answers,
    });
  }),

  ...handle('delete', '/api/appointments/:id', async ({ request, params }) => {
    if (!userFromRequest(request)) return unauthorized();
    await delay(LATENCY);
    const index = appointments.findIndex((a) => a.id === Number(params.id));
    if (index === -1) return new HttpResponse(null, { status: 404 });

    const slot = slots.find((s) => s.id === appointments[index].slotId);
    if (slot) {
      slot.status = 'FREE';
      slot.patientId = null;
    }
    const triage = triageResults.findIndex(
      (r) => r.appointmentId === appointments[index].id,
    );
    if (triage !== -1) triageResults.splice(triage, 1);

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
