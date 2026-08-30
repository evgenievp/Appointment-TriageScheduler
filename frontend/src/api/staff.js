import { request } from './client';

// Записване по телефона от регистратурата. Редът е задържане, после прехвърляне:
// служителят първо запазва часа за себе си (`bookSlot` от `appointments.js`),
// после му праща триажа, и чак накрая го дава на пациента. Триажът трябва да е
// преди прехвърлянето — `TriageService.submitTriage` сверява пациента на
// резервацията с викащия, тоест след прехвърлянето служителят получава 403.

// UserDto: { id, name, phone, email } — един пациент, не списък. Търсенето е по
// точно съвпадение на телефона, значи резултатът е най-много един.
//
// Ненамерен идва като 500, не като 404 — `findSlotByUserPhone` хвърля
// `EntityNotFoundException`. Затова викащият не бива да различава „няма такъв“
// от истинска грешка: и в двата случая пътят напред е ръчно въведени име и
// телефон. Номерът се праща в E.164; този ендпойнт не нормализира входа (за
// разлика от `assign`), тоест номер с интервали би гръмнал.
// Приема и списък: `users.phone` няма уникален индекс и регистрацията не го
// проверява, тоест два профила с един номер са възможни. Днес това дава 500,
// защото `findByPhone` връща `Optional`; щом го поправят на списък, тук нищо
// не се променя.
export const findPatientByPhone = async (phone) => {
  const found = await request(`/staff/patient/${encodeURIComponent(phone)}`);
  return Array.isArray(found) ? (found[0] ?? null) : found;
};

// SlotDto. Прехвърля задържания час на пациента, намерен по телефон.
//
// Сървърът търси пациента наново по същия номер, вместо да приеме ид-то, което
// търсенето вече е върнало. Работи, но значи, че **непознат номер гърми с 500** —
// няма как да се подаде име, тоест пациент без профил още не се поддържа.
export const assignSlot = (slotId, phone) =>
  request(`/staff/slots/${slotId}/assign?phone=${encodeURIComponent(phone)}`, {
    method: 'PUT',
  });

// Повишаване на роля. Няма ендпойнт за търсене на потребител по имейл, тоест
// самото повишаване е и проверката: 404 значи „няма такъв“.
//
// Двата метода са различни, както са в контролера — `PATCH` за персонал и `PUT`
// за лекар. Едното е смяна на едно поле, другото създава и ред в `doctor`.

// UserDto
export const promoteToStaff = (email) =>
  request('/staff/promoteToStaff', { method: 'PATCH', body: JSON.stringify({ email }) });

// DoctorDto
export const promoteToDoctor = (email, speciality) =>
  request('/staff/promoteToDoctor', {
    method: 'PUT',
    body: JSON.stringify({ email, speciality }),
  });
