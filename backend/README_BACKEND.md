# Backend — Appointment & Triage Scheduler


## 1. Стартиране на приложението

### 1.1. С локална PostgreSQL


1. Настрой `application.properties` (в `src/main/resources/`):
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/triage_db
   spring.datasource.username=postgres
   spring.datasource.password=postgres
   spring.jpa.hibernate.ddl-auto=update
   ```

2. Стартирай приложението:
   ```bash
   ./mvnw spring-boot:run
   ```
   или директно от IntelliJ.

3. Приложението ще работи на `http://localhost:8080`
или... в applications.properties 
server.port= избран порт


## 4. Ендпойнти (които работят)

### 4.1. Слотове (`/api/slots`)

| Метод | Ендпойнт                                                | Описание                                               |
|-------|---------------------------------------------------------|--------------------------------------------------------|
| GET | `/api/slots/free?doctorId={id}&from={from}&to={to}`     | Връща **свободните** слотове за лекар в период         |
| GET | `/api/slots/calendar?doctorId={id}&from={from}&to={to}` | Връща **всички** слотове за лекар (за календар)        |
| POST | `/api/slots/generate`                                   | Генерира слотове за лекар (само за администратор/тест) |
| POST | `/api/slots/setRestStart`                               | Задава ръчно начало на обедна почивка - иначе е 12.:00 |
| POST | `/api/slots/setRestEnd`                                 | Задава ръчно край на обедна почивка - иначе е 13:00    |

 

**Пример за `from`/`to`:** `2026-08-12T00:00:00`

---

### 4.4. Лекари и почивни дни (`/api/doctors`)

| Метод | Ендпойнт | Описание |
|-------|----------|-----------|
| GET | `/api/doctors/me` | Връща информация за логнатия лекар (изисква JWT) |
| GET | `/api/doctors/me/exceptions` | Връща почивните дни на логнатия лекар |
| POST | `/api/doctors/me/exceptions` | Добавя почивен ден (изключение) |
| DELETE | `/api/doctors/me/exceptions/{id}` | Изтрива почивен ден по ID |

**Пример за добавяне на почивен ден:**
```json
{
  "date": "2026-08-15",
  "reason": "VACATION"
}
```

---

### 4.5. Резервации (`/api/appointments`)

| Метод | Ендпойнт | Описание |
|-------|----------|-----------|
| POST | `/api/appointments/book/{slotId}` | Резервира слот за логнатия пациент |
| GET | `/api/appointments/me` | Връща всички резервации на логнатия пациент |
| DELETE | `/api/appointments/{id}` | Отказва резервация |

---

### 4.5. Триаж (`/api/triage`)

| Метод | Ендпойнт | Описание |
|-------|----------|-----------|
| POST | `/api/triage/{appointmentId}` | Попълва триаж за дадена резервация |
| GET | `/api/triage/{appointmentId}` | Връща триаж резултата за резервация |

---

## 5. Автентикация (JWT)

В момента **JWT не е напълно интегриран**. Ендпойнтите, които изискват `Authentication`, все още не са тествани с реални токени.

За тестови цели можеш да използваш **Postman** или да коментираш `@PreAuthorize` временно.

---

