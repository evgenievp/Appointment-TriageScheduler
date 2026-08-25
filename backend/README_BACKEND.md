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

3. Приложението ще работи на `http://localhost:8081`
или... в applications.properties 
server.port= избран порт


## 4. Ендпойнти (които работят)

### 4.1. Слотове (`/api/slots`)

| Метод | Ендпойнт                                            | Описание                                                                                             |
|-------|-----------------------------------------------------|------------------------------------------------------------------------------------------------------|
| GET   | `/api/slots/free?doctorId={id}&from={from}&to={to}` | Връща **свободните** слотове за лекар в период                                                       |
| GET   | `/api/slots/calendar`                               | Връща **всички** слотове за лекар (за календар) приема from и to                                     |
| POST  | `/api/slots/generate`                               | Генерира слотове за лекар (само за администратор/тест)                                               |
| POST  | `/api/slots/setRestStart`                           | Задава ръчно начало на обедна почивка - иначе е 12.:00                                               |
| POST  | `/api/slots/setRestEnd`                             | Задава ръчно край на обедна почивка - иначе е 13:00                                                  |
| GET   | `/api/slots/preview`                                | Позволява преглед на слотовете, без тяхното запазване. Запазването остава да се прави през /generate |


**Ендпойнт: `/api/slots/free?doctorId={id}&from={from}&to={to}` приема id на лекар, две дати в исо формат- пример: GET /api/slots/free?doctorId=2&from=2026-08-25T00:00:00&to=2026-08-25T23:59:59**
**Методът връща списък със слотове за доктори, пациенти и техните статуси с времената им. Примерен отговор: **
{
   "id": 101,
   "startTime": "2026-08-25T09:00:00",
   "endTime": "2026-08-25T09:30:00",
   "doctorId": 2,
   "status": "FREE",
   "patientId": null
},
{
   "id": 102,
   "startTime": "2026-08-25T10:00:00",
   "endTime": "2026-08-25T10:30:00",
   "doctorId": 2,
   "status": "FREE",
   "patientId": null
}

**Ендпойнт: `/api/slots/calendar` приема: id на лекар и две дати като при /free само че тук са дни - Пример: 	2026-08-25T00:00:00 **
**Методът връща списък с дни, тяхното работно време, статус и пациент:
{
   "id": 101,
   "startTime": "2026-08-25T09:00:00",
   "endTime": "2026-08-25T09:30:00",
   "doctorId": 2,
   "status": "FREE",
   "patientId": null
},
{
   "id": 102,
   "startTime": "2026-08-25T09:30:00",
   "endTime": "2026-08-25T10:00:00",
   "doctorId": 2,
   "status": "BOOKED",
   "patientId": 5
},

**Ендпойнт: `/api/slots/generate` приема generate slots request с doctorId, начална дата, крайна дата и начало и край на работен ден **
**Методът връща списък със слотове - пример:**

{
   "id": 101,
   "startTime": "2026-08-25T09:00:00",
   "endTime": "2026-08-25T09:30:00",
   "doctorId": 2,
   "status": "FREE",
   "patientId": null
},
{
   "id": 102,
   "startTime": "2026-08-25T09:30:00",
   "endTime": "2026-08-25T10:00:00",
   "doctorId": 2,
   "status": "BOOKED",
   "patientId": 5
}

**Ендпойнт: `/api/slots/setRestStart` приема час - пример: 2026-08-25T09:12:00
**Методът връща - само статус код 201 (ако командата е приета). Просто ще сложи начало на интервал, в който не се генерират слотове.

**Ендпойнт: `/api/slots/setRestEnd` приема час - пример: 2026-08-25T09:13:00
**Методът връща - само статус код 201 (ако командата е приета). Просто ще сложи край на интервал, в който не се генерират слотове.


**Eндпойнт: `/api/slots/preview` приема generate slots request с doctorId, начална дата, крайна дата и начало и край на работен ден **
този метод почти дублира generate, но не запазва слотовете. Може да се използва само за превю на лекарите.
**Методът връща списък със слотове, който не се записва в базата.
```
---

### 4.4. Лекари и почивни дни (`/api/doctors`)

| Метод | Ендпойнт | Описание |
|-------|----------|-----------|
| GET | `/api/doctors/me` | Връща информация за логнатия лекар (изисква JWT) |
| GET | `/api/doctors/me/exceptions` | Връща почивните дни на логнатия лекар |
| POST | `/api/doctors/me/exceptions` | Добавя почивен ден (изключение) |
| DELETE | `/api/doctors/me/exceptions/{id}` | Изтрива почивен ден по ID |
| GET | `/api/doctors/` | зарежда 5 произволни лекари|


**Пример за добавяне на почивен ден:**
```json
{
  "date": "2026-08-15",
  "reason": "VACATION"
}
```
**Ендпойнт: `/api/doctors/` не приема аргументи. Връща просто 5 произволни лекари.**
**Пример за резултат от метода: **

{
   "id": 3,
   "name": "Д-р Иванова",
   "specialty": "Кардиология",
   "room": "205"
},
{
   "id": 7,
   "name": "Д-р Петров",
   "specialty": "Неврология",
   "room": "112"
},

**Пример за добавяне на лекар: **
```
{
   "name": "Д-р Атанас Иванов",
   "speciality": "ревматолог",
   "role": "DOCTOR"
}
```
**Ендпойнт: `/api/doctors/me/exceptions` (GET) изисква логнат потребител и не приема входни параметри**
**Методът връща: списък от почивни дни - например: **
{
   "id": 1,
   "date": "2026-08-25",
   "reason": "VACATION",
   "fullDay": true
},
{
   "id": 2,
   "date": "2026-08-27",
   "reason": "SICK_LEAVE",
   "fullDay": true
}

**Ендпойнт: `/api/doctors/me/exceptions` (POST) приема дата, причина и лекар от контекста на логнатия лекар**
**Методът връща:**
{
   "id": 5,
   "date": "2026-08-25",
   "reason": "VACATION"
}

**Ендпойнт: `/api/doctors/me/exceptions/{id}` - методът си взима id като пат вариъбъл.**
**Методът връща - ексепшън дей дто с тези параметри**

Long id,
LocalDate date,
ExceptionReason reason,
Doctor doctor


---

### 4.5. Резервации (`/api/appointments`)

| Метод | Ендпойнт | Описание |
|-------|----------|-----------|
| POST | `/api/appointments/book/{slotId}` | Резервира слот за логнатия пациент |
| GET | `/api/appointments/me` | Връща всички резервации на логнатия пациент |
| DELETE | `/api/appointments/{id}` | Отказва резервация |


**Ендпойнт: `/api/appointments/book/{slotId}` взима слот ид от пътя**
**Методът връща готов апойнтмънт - пример: **
{
   "id": 12,
   "slotId": 5,
   "patientId": 3,
   "doctorId": 2,
   "status": "CONFIRMED",
   "startTime": "2026-08-25T10:00:00",
   "endTime": "2026-08-25T10:30:00"
}

**Ендпойнт: `/api/appointments/me`  методът изисква аутентикация, но не приема методи**
**Методът връща списък от апойнтмънтс: 


{
   "id": 1,
   "slotId": 5,
   "patientId": 3,
   "doctorId": 2,
   "appointmentTime": "2026-08-25T10:00:00",
   "status": "CONFIRMED",
   "notes": "Първи преглед"
},
{
   "id": 2,
   "slotId": 12,
   "patientId": 3,
   "doctorId": 4,
   "appointmentTime": "2026-08-27T14:30:00",
   "status": "CANCELLED",
   "notes": null
}


**Ендпойнт: `/api/appointments/{id}` - методът си взима от пътя ид и отказва среща**
**Резултатът е едно риспонс ентити ок.. все едно го няма **

---
**Пример за добяване на резервации:**
докторът, слотът и пациентът трябва да се вземат от базата данни
```
{
   "doctor": "Doctor", 
   "slot": "slot",
   "patient": "patient",
   "status"; "FREE/BOOKED/BLOCKED" (these are status possibilities)
}
```
---
### 4.5. Триаж (`/api/triage`)

| Метод | Ендпойнт | Описание |
|-------|----------|-----------|
| POST | `/api/triage/{appointmentId}` | Попълва триаж за дадена резервация |
| GET | `/api/triage/{appointmentId}` | Връща триаж резултата за резервация |

---

### 5 Аутентикация ('/api/auth/')
| Метод | Ендпойнт                    | Описание                        |
|-------|-----------------------------|---------------------------------|
| POST | `/api/triage/auth/login`    | Ендпойнт за вход на юзър        |
| POST | `/api/triage/auth/register` | Ендпойнт за регистрация на юзър |


