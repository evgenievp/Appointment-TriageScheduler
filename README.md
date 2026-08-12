# Appointment & Triage Scheduler

A clinic appointment booking system with simple triage that orders patients by priority and time slot. Educational project (Project 9 · Healthcare).

## Features

- 📅 Slot calendar per doctor/room, generated from working hours
- 🧾 Patients can book, reschedule, and cancel appointments
- 🚑 Triage questionnaire at booking time → priority **urgent / normal**
- 🔒 Double-booking protection under concurrent requests (DB constraints + atomic compare-and-swap + optimistic locking)
- 👩‍⚕️ Staff view: daily schedule per doctor and a priority-ordered queue
- 🌱 Seed data: doctors, working hours, and slots for the next 2 weeks

## Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Java 21, Spring Boot 3.x, Spring Web, Spring Data JPA, Spring Security (JWT) |
| Database | PostgreSQL |
| Frontend | React, Vite, TanStack Query, React Router |

## Triage

At booking time the patient fills in a short questionnaire (pain level, fever, shortness of breath, symptom duration, etc.). Answers are scored deterministically: each answer contributes points, and a total above the threshold yields `URGENT` priority. Certain combinations (e.g. chest pain + shortness of breath) are "red flags" and result in `URGENT` directly. Staff can see both the answers and the computed score in the priority queue.

## Team

| Collaborator | Role | Responsibilities |
|---|---|---|
| [@evgenievp](https://github.com/evgenievp) | Backend | Data model, migrations, seed, doctors/slots, triage scoring |
| [@victormanin151](https://github.com/victormanin151) | Backend | Auth, booking transaction, concurrency tests, error handling |
| [@eomayski](https://github.com/eomayski) | Frontend | Patient flow (calendar, wizard, my appointments), staff dashboard, MSW |

## Bonus Features (time permitting)

- Waitlist for freed-up slots
- Appointment reminders (`@Scheduled` job)
- Doctor workload metrics
