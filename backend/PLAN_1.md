# Appointment & Triage Scheduler — План за реализация

**Проект 9 · Healthcare** · Екип: 3 души (2× бекенд, 1× фронтенд) · Стек: Java/Spring · React · PostgreSQL

---

## 1. Стек и архитектура

**Бекенд:** Spring Boot 3.x (Java 21), Spring Web, Spring Data JPA (Hibernate), Spring Security + JWT, PostgreSQL. Валидация с Jakarta Bean Validation (`@Valid`, `@NotNull`…). springdoc-openapi за автоматичен Swagger UI — жив Swagger спестява голяма част от комуникацията между бекенд и фронтенд.

**Фронтенд:** React + Vite, TanStack Query за server state, React Router. Стилизация по избор (Tailwind върви бързо).


**Роли:** `PATIENT` и `STAFF`, пазени в JWT claims, енфорсвани с `@PreAuthorize("hasRole('STAFF')")` на staff ендпойнтите.

---

## 2. Модел на данните (JPA entities)

| Entity | Полета (основни) | Бележки |
|---|---|---|
| `User` | email, passwordHash, role, name, phone | роля PATIENT / STAFF |
| `Doctor` | name, specialty, room | |
| `WorkingHours` | doctor, weekday (0–6), startTime, endTime, slotMinutes | шаблон за генериране на слотове |
| `Slot` | doctor, startsAt, endsAt, status (FREE / BOOKED / BLOCKED), `@Version` | **UNIQUE (doctor_id, starts_at)** |
| `Appointment` | slot (`@OneToOne`), patient, status (CONFIRMED / CANCELLED / DONE) | **UNIQUE (slot_id)** |
| `TriageResult` | appointment, answers (jsonb), priority (URGENT / NORMAL), score | jsonb през `@JdbcTypeCode(SqlTypes.JSON)` |


**Важни решения:**

- Миграциите се пишат на ръка с Flyway (`V1__init.sql`, …), а Hibernate работи с `ddl-auto: validate`. Уникалните constraints са критични за заданието и трябва да са явни в SQL, не генерирани.
- Слотовете се **генерират предварително** от `WorkingHours` — seed при стартиране (`CommandLineRunner` или Flyway seed миграция) + admin ендпойнт „генерирай за период“. Така резервацията става UPDATE на конкретен ред, което прави конкурентността контролируема.
- Всички времена се пазят в UTC (`Instant`); конверсия към локално време — само в UI.

---

## 3. Двойно записване — трислойна защита

Сърцето на заданието. Три независими слоя:

### Слой 1 — DB constraints

`UNIQUE (doctor_id, starts_at)` върху `slots` и `UNIQUE (slot_id)` върху `appointments`. Базата е последната инстанция — дори при бъг в кода двоен запис е невъзможен.

### Слой 2 — атомарен conditional UPDATE (compare-and-swap)

Вместо read-then-write:

```java
public interface SlotRepository extends JpaRepository<Slot, UUID> {
    @Modifying
    @Query("UPDATE Slot s SET s.status = 'BOOKED' " +
           "WHERE s.id = :id AND s.status = 'FREE'")
    int bookIfFree(@Param("id") UUID id);
}
```

```java
@Service
public class BookingService {
    @Transactional
    public Appointment book(UUID slotId, UUID patientId, TriageAnswers answers) {
        int updated = slotRepository.bookIfFree(slotId);
        if (updated == 0) {
            throw new SlotAlreadyBookedException(slotId); // → 409 Conflict
        }
        Slot slot = slotRepository.getReferenceById(slotId);
        Appointment appt = appointmentRepository.save(new Appointment(slot, patientId));
        triageService.scoreAndAttach(appt, answers);
        return appt;
    }
}
```

При два едновременни request-а PostgreSQL сериализира UPDATE-ите на реда: първият минава, вторият вижда `status != FREE`, получава `updated == 0` → 409. `@ControllerAdvice` мапва exception-а към `409 { "code": "SLOT_TAKEN" }`.

### Слой 3 — `@Version` (optimistic locking)

Хваща всеки друг код път, който би модифицирал слот през стандартен save — `OptimisticLockException` също се мапва към 409.

### Пренасрочване и отказ

- **Пренасрочване** — една `@Transactional` операция: `bookIfFree(newSlotId)` → при успех старият слот се освобождава (`BOOKED → FREE`) и appointment-ът се обновява. При неуспех — 409 и rollback, нищо не се променя.
- **Отказ** — статус `CANCELLED` + освобождаване на слота (+ проверка на waitlist при bonus).

### Демонстрация (задължителна)

Тест с `ExecutorService`, който пуска 20 паралелни заявки към един слот и assert-ва **точно 1 успех и 19 конфликта**. Изпълнява се като `@SpringBootTest` срещу **Testcontainers PostgreSQL** — не срещу H2, чиято concurrency семантика е различна. Тестът е и демо материал за защитата на проекта.

---

## 4. Триаж

Детерминистичен скоринг, без магия:

- 5–7 въпроса: болка (0–10), температура, задух (да/не), продължителност на симптомите, гръдна болка (да/не), хронични заболявания.
- Всеки отговор носи точки; сума ≥ праг → `URGENT`, иначе `NORMAL`.
- **Червени флагове** (напр. гръдна болка + задух, температура ≥ 39.5) → директно `URGENT` независимо от сумата.
- Пазят се `answers` (jsonb) + `score` + `priority`, за да вижда персоналът обосновката.

Въпросникът се дефинира като конфигурация (enum или JSON ресурс), не хардкоднат в if-ове — лесно се разширява и се тества таблично (JUnit `@ParameterizedTest`).

**Опашка за персонала:** днешните CONFIRMED appointments, `ORDER BY priority DESC, starts_at ASC`.

---

## 5. API контракт

Фиксира се в първите дни — това е интерфейсът между бекенд и фронтенд.

```
POST   /api/auth/register            { email, password, name, phone }
POST   /api/auth/login               → { token, role }

GET    /api/doctors
GET    /api/doctors/{id}/slots?from=&to=&status=FREE

POST   /api/appointments             { slotId, triageAnswers } → 201 | 409
PATCH  /api/appointments/{id}/reschedule  { newSlotId } → 200 | 409
DELETE /api/appointments/{id}        (отказ)
GET    /api/me/appointments

GET    /api/staff/schedule?date=     (грид по лекар/час)   [STAFF]
GET    /api/staff/queue?date=        (по приоритет)        [STAFF]
POST   /api/admin/slots/generate     { doctorId, from, to } [STAFF]
```

**Договорки:**

- Формат на грешките: `{ "code": "...", "message": "..." }`.
- Конфликт при резервация е винаги `409` с `code: "SLOT_TAKEN"` — фронтендът разчита на това.
- По възможност контрактът се описва като OpenAPI yaml още в началото.

---

## 6. Фронтенд

**Страници и flow:**

1. **Логин/регистрация** — token в memory или localStorage (приемливо за учебен проект).
2. **Избор на лекар** — списък/карти с филтър по специалност.
3. **Календар със слотове** — седмичен изглед: колони дни, редове часове, свободните слотове кликаеми. Собствен грид върху данните от API-то (без календарна библиотека — по-просто и по-контролируемо). `useQuery(['slots', doctorId, weekStart])`.
4. **Booking wizard** — стъпка 1: потвърждение на слот; стъпка 2: триаж въпросник (слайдер за болка, radio за да/не); стъпка 3: резюме → POST.
5. **Моите часове** — бъдещи/минали, пренасрочване (същият календар в режим „избери нов слот“) и отказ (confirm диалог).
6. **Staff dashboard** — два таба: дневен график (грид лекар × час, цветово кодиран по статус) и приоритетна опашка (URGENT най-отгоре с червен badge + триаж score).

**Ключови технически моменти:**

- **409 handling:** при `SLOT_TAKEN` → toast „Този час беше зает току-що“, `queryClient.invalidateQueries(['slots'])`, календарът се обновява. Демонстрира се на живо с два браузъра.
- Мутации през `useMutation` с `onSuccess` → invalidate на slots + me/appointments.
- Опционално `refetchInterval: 15000` на слотовете — заетите часове „изчезват“ почти на живо.
- Role-based routing: guard компонент чете ролята от token-а и крие staff маршрутите.
- Докато бекендът не е готов, фронтендът работи срещу **MSW (Mock Service Worker)** по договорения контракт — превключването към реалното API е смяна на един флаг. Така двата екипа работят паралелно без чакане.

---

## 7. Фази и разпределение

Разпределение: **Бекенд А**, **Бекенд Б**, **Фронтенд**.

### Фаза 0 — Контракт и скеле (дни 1–2, всички заедно)

Най-важната фаза при разделени екипи.

- **Заедно:** фиксиране на API контракта (пътища, DTO-та, формат на грешки, 409 семантика), избор repo структура.
- **Бекенд А:** Spring Boot скеле, Flyway V1, docker-compose с PostgreSQL, **CORS конфигурация** (сега, не в деня на интеграцията).
- **Бекенд Б:** auth (Spring Security + JWT).
- **Фронтенд:** Vite скеле, routing, MSW mock-ове по контракта, логин страница.

### Фаза 1 — Ядро (дни 3–5)

- **Бекенд А:** entities, seed (3–4 лекари, работно време, генератор на слотове), GET ендпойнти за лекари/слотове.
- **Бекенд Б:** booking транзакция + cancel/reschedule + **конкурентен тест с Testcontainers**.
- **Фронтенд:** избор на лекар + календарен грид + booking flow без триаж (срещу MSW); към края на фазата — първо свързване с реалното API.

### Фаза 2 — Триаж и staff (дни 6–8)

- **Бекенд А:** триаж скоринг + parameterized тестове + queue/schedule ендпойнти.
- **Бекенд Б:** reschedule edge cases, `@ControllerAdvice` error handling, Swagger полиране.
- **Фронтенд:** триаж въпросник в wizard-а, „Моите часове“, staff dashboard.

### Фаза 3 — Интеграция и полиране (дни 9–10, всички)

- End-to-end тестване на пълния flow.
- 409 демо сценарий с два браузъра.
- Loading/error състояния.
- README: ER диаграма, обяснение на трислойната защита, инструкции за стартиране, демо скрипт за защитата.

---

## 8. Bonus (по приоритет)

1. **Waitlist** — таблица `WaitlistEntry`; при cancel се взема първият чакащ. Внимание: и тук е нужна атомарност.
2. **Напомняния** — `@Scheduled` job, който периодично търси часове в следващите 24ч без изпратено напомняне; за учебен проект логване/фалшив имейл е достатъчно.
3. **Метрики за натовареност** — заета/свободна заетост по лекар за седмица: една GROUP BY заявка + bar chart (recharts) на фронтенда.

---

## 9. Рискове, които се адресират рано

| Риск | Мярка |
|---|---|
| Часови зони | Всичко в UTC/`Instant`, конверсия само в UI |
| CORS | Конфигурира се в ден 1 |
| Тестове на грешна база | Конкурентните тестове са срещу Testcontainers PostgreSQL, никога H2 |
| Разминаване на API контракта | OpenAPI yaml + Swagger UI + MSW mock-ове по същия контракт |
| Двоен запис при race condition | Трислойна защита: DB constraints + CAS UPDATE + `@Version` |
